"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MakeupStrokeContext = createContext({
  motionActive: false,
  revealedIds: new Set(),
  setMotionActive: () => {},
  setRevealedIds: () => {},
});

const SAMPLES_PER_SEGMENT = 22;

// Deterministic bristle definitions: drift is in core half-widths, width in
// core widths. Seeded sines instead of Math.random so SSR, hydration, and
// re-measures always produce identical geometry. `inside` strands are furrow
// streaks that stay within the core's width profile; the rest are faint
// flyaway bristles just outside it.
const BRISTLE_STRANDS = [
  { drift: -0.62, inside: true, opacity: 0.3, phase: 1.1, seed: 2.3, sway: 3.4, width: 0.055 },
  { drift: -0.24, inside: true, opacity: 0.24, phase: 2.9, seed: 5.1, sway: 4.2, width: 0.07 },
  { drift: 0.18, inside: true, opacity: 0.28, phase: 4.4, seed: 8.6, sway: 3.8, width: 0.05 },
  { drift: 0.55, inside: true, opacity: 0.32, phase: 0.4, seed: 12.2, sway: 2.9, width: 0.065 },
  { dash: "88 74", drift: -1.12, opacity: 0.15, phase: 3.6, seed: 6.4, sway: 5.1, width: 0.055 },
  { dash: "64 108", drift: 1.08, opacity: 0.13, phase: 5.3, seed: 9.7, sway: 4.4, width: 0.05 },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getStrokePoint(element, rootRect, rootWidth, rootHeight, isNarrow) {
  const rect = element.getBoundingClientRect();
  const side = element.dataset.strokeSide || "center";
  const yRatio = Number.parseFloat(element.dataset.strokeY || "0.5");
  const inset = isNarrow
    ? clamp(rootWidth * 0.08, 22, 54)
    : clamp(rootWidth * 0.055, 42, 92);
  const localLeft = rect.left - rootRect.left;
  const localRight = rect.right - rootRect.left;
  const localCenter = localLeft + rect.width * 0.5;
  const sidePull = isNarrow ? 0.16 : 0.22;

  let x = localCenter;

  if (side === "start") {
    x = localLeft + rect.width * sidePull;
  }

  if (side === "end") {
    x = localRight - rect.width * sidePull;
  }

  if (side === "outer-start") {
    x = localLeft - (isNarrow ? 18 : 42);
  }

  if (side === "outer-end") {
    x = localRight + (isNarrow ? 18 : 42);
  }

  if (isNarrow && (side === "start" || side === "outer-start")) {
    x = Math.min(x, rootWidth * 0.38);
  }

  if (isNarrow && (side === "end" || side === "outer-end")) {
    x = Math.max(x, rootWidth * 0.62);
  }

  return {
    id: element.dataset.revealId,
    x: clamp(x, inset, rootWidth - inset),
    y: clamp(
      rect.top - rootRect.top + rect.height * clamp(yRatio, 0.12, 0.88),
      24,
      rootHeight - 24,
    ),
  };
}

function buildRoutePoints(measuredPoints, width, height, isNarrow) {
  const groupingDistance = isNarrow ? 250 : 340;
  const sideInset = isNarrow
    ? clamp(width * 0.09, 28, 56)
    : clamp(width * 0.08, 72, 140);
  const groups = [];

  measuredPoints.forEach((point) => {
    const group = groups[groups.length - 1];

    if (!group || point.y - group.startY > groupingDistance) {
      groups.push({
        points: [point],
        startY: point.y,
      });
      return;
    }

    group.points.push(point);
  });

  const routePoints = groups.map((group, index) => {
    const averageX =
      group.points.reduce((sum, point) => sum + point.x, 0) /
      group.points.length;
    const averageY =
      group.points.reduce((sum, point) => sum + point.y, 0) /
      group.points.length;
    const previous = index > 0 ? groups[index - 1].routePoint : null;
    const softenedX = previous ? previous.x * 0.24 + averageX * 0.76 : averageX;
    const routePoint = {
      x: clamp(softenedX, sideInset, width - sideInset),
      y: clamp(averageY, 24, height - 24),
    };

    group.routePoint = routePoint;
    return routePoint;
  });

  const first = routePoints[0];
  const last = routePoints[routePoints.length - 1];

  return [
    {
      x: first.x,
      y: clamp(first.y - (isNarrow ? 150 : 220), 18, height),
    },
    ...routePoints,
    {
      x: last.x,
      y: clamp(last.y + (isNarrow ? 150 : 220), 18, height - 18),
    },
  ];
}

function buildSegments(points, isNarrow) {
  const curve = isNarrow ? 0.9 : 1;
  const segments = [];

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const beforePrevious = points[Math.max(0, index - 2)];
    const point = points[index];
    const afterPoint = points[Math.min(points.length - 1, index + 1)];
    const deltaY = Math.max(42, point.y - previous.y);

    segments.push({
      controlOne: {
        x: previous.x + ((point.x - beforePrevious.x) * curve) / 6,
        y: clamp(
          previous.y + ((point.y - beforePrevious.y) * curve) / 6,
          previous.y + deltaY * 0.18,
          previous.y + deltaY * 0.58,
        ),
      },
      controlTwo: {
        x: point.x - ((afterPoint.x - previous.x) * curve) / 6,
        y: clamp(
          point.y - ((afterPoint.y - previous.y) * curve) / 6,
          point.y - deltaY * 0.58,
          point.y - deltaY * 0.18,
        ),
      },
      from: previous,
      to: point,
    });
  }

  return segments;
}

function buildMaskPath(segments) {
  const [first] = segments;

  return segments.reduce(
    (path, segment) =>
      `${path} C ${segment.controlOne.x.toFixed(1)} ${segment.controlOne.y.toFixed(
        1,
      )}, ${segment.controlTwo.x.toFixed(1)} ${segment.controlTwo.y.toFixed(
        1,
      )}, ${segment.to.x.toFixed(1)} ${segment.to.y.toFixed(1)}`,
    `M ${first.from.x.toFixed(1)} ${first.from.y.toFixed(1)}`,
  );
}

function cubicPoint(segment, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;

  return {
    x:
      a * segment.from.x +
      b * segment.controlOne.x +
      c * segment.controlTwo.x +
      d * segment.to.x,
    y:
      a * segment.from.y +
      b * segment.controlOne.y +
      c * segment.controlTwo.y +
      d * segment.to.y,
  };
}

function cubicTangent(segment, t) {
  const u = 1 - t;

  return {
    x:
      3 * u * u * (segment.controlOne.x - segment.from.x) +
      6 * u * t * (segment.controlTwo.x - segment.controlOne.x) +
      3 * t * t * (segment.to.x - segment.controlTwo.x),
    y:
      3 * u * u * (segment.controlOne.y - segment.from.y) +
      6 * u * t * (segment.controlTwo.y - segment.controlOne.y) +
      3 * t * t * (segment.to.y - segment.controlTwo.y),
  };
}

function sampleSegments(segments) {
  const samples = [];
  let travelled = 0;

  segments.forEach((segment, segmentIndex) => {
    const startStep = segmentIndex === 0 ? 0 : 1;

    for (let step = startStep; step <= SAMPLES_PER_SEGMENT; step += 1) {
      const t = step / SAMPLES_PER_SEGMENT;
      const point = cubicPoint(segment, t);
      const tangent = cubicTangent(segment, t);
      const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
      const previous = samples[samples.length - 1];

      if (previous) {
        travelled += distance(previous, point);
      }

      samples.push({
        nx: -tangent.y / tangentLength,
        ny: tangent.x / tangentLength,
        travelled,
        x: point.x,
        y: point.y,
      });
    }
  });

  const totalLength = Math.max(travelled, 1);

  samples.forEach((sample) => {
    sample.t = sample.travelled / totalLength;
  });

  return samples;
}

function edgeNoise(t, seed) {
  return (
    Math.sin(t * 31 + seed * 2.7) * 0.5 +
    Math.sin(t * 73 + seed * 5.3) * 0.3 +
    Math.sin(t * 12 + seed) * 0.2
  );
}

// Brush pressure along the gesture: zero-width tips where the brush touches
// down and lifts off, swelling and easing between them.
function widthProfile(t) {
  const taper = Math.sin(Math.PI * clamp(t, 0, 1)) ** 0.6;
  const pressure =
    0.74 + 0.26 * Math.sin(t * 8.6 + 1.7) * Math.sin(t * 2.9 + 0.4);

  return taper * pressure;
}

function buildCorePath(samples, strokeWidth) {
  const leftEdge = [];
  const rightEdge = [];

  samples.forEach((sample) => {
    const half = strokeWidth * widthProfile(sample.t) * 0.5;
    const leftHalf = half * (1 + 0.13 * edgeNoise(sample.t, 3.1));
    const rightHalf = half * (1 + 0.13 * edgeNoise(sample.t, 8.7));

    leftEdge.push(
      `${(sample.x + sample.nx * leftHalf).toFixed(1)} ${(
        sample.y + sample.ny * leftHalf
      ).toFixed(1)}`,
    );
    rightEdge.push(
      `${(sample.x - sample.nx * rightHalf).toFixed(1)} ${(
        sample.y - sample.ny * rightHalf
      ).toFixed(1)}`,
    );
  });

  return `M ${leftEdge[0]} L ${leftEdge
    .slice(1)
    .join(" L ")} L ${rightEdge.reverse().join(" L ")} Z`;
}

function buildStrandPath(samples, strokeWidth, strand) {
  const points = samples.map((sample) => {
    const shape = strand.inside
      ? widthProfile(sample.t)
      : Math.sin(Math.PI * clamp(sample.t, 0, 1)) ** 0.35;
    const offset =
      strokeWidth *
        0.5 *
        strand.drift *
        shape *
        (0.82 + 0.18 * Math.sin(sample.t * strand.sway + strand.phase)) +
      strokeWidth *
        (strand.inside ? 0.03 : 0.07) *
        edgeNoise(sample.t, strand.seed);

    return `${(sample.x + sample.nx * offset).toFixed(1)} ${(
      sample.y + sample.ny * offset
    ).toFixed(1)}`;
  });

  return `M ${points[0]} L ${points.slice(1).join(" L ")}`;
}

function getRouteProgressAtY(routePoints, cumulativeDistances, totalDistance, y) {
  const firstPoint = routePoints[0];
  const lastPoint = routePoints[routePoints.length - 1];

  if (y <= firstPoint.y) {
    return 0;
  }

  if (y >= lastPoint.y) {
    return 1;
  }

  for (let index = 1; index < routePoints.length; index += 1) {
    const previous = routePoints[index - 1];
    const next = routePoints[index];

    if (y > next.y) {
      continue;
    }

    const localProgress = clamp((y - previous.y) / Math.max(next.y - previous.y, 1), 0, 1);
    const projectedPoint = {
      x: previous.x + (next.x - previous.x) * localProgress,
      y: previous.y + (next.y - previous.y) * localProgress,
    };

    return clamp(
      (cumulativeDistances[index - 1] + distance(previous, projectedPoint)) /
        Math.max(totalDistance, 1),
      0,
      1,
    );
  }

  return 1;
}

function buildThresholds(revealPoints, routePoints, viewportHeight) {
  const cumulativeDistances = [0];
  let totalDistance = 0;

  for (let index = 1; index < routePoints.length; index += 1) {
    totalDistance += distance(routePoints[index - 1], routePoints[index]);
    cumulativeDistances[index] = totalDistance;
  }

  const initialViewportLine = viewportHeight * 0.78;

  return revealPoints
    .map((point) => {
      if (!point.id) {
        return null;
      }

      return {
        id: point.id,
        threshold:
          point.y <= initialViewportLine
            ? 0
            : getRouteProgressAtY(
                routePoints,
                cumulativeDistances,
                totalDistance,
                point.y,
              ),
      };
    })
    .filter(Boolean);
}

function getDarkBand(root, rootRect, rootWidth, rootHeight) {
  const darkBand = root.querySelector("[data-stroke-dark-band]");

  if (!darkBand) {
    return null;
  }

  const rect = darkBand.getBoundingClientRect();
  const y = clamp(rect.top - rootRect.top, 0, rootHeight);
  const height = clamp(rect.height, 0, rootHeight - y);

  return {
    x: 0,
    y,
    width: rootWidth,
    height,
  };
}

function getGeometry(root) {
  const anchors = Array.from(
    root.querySelectorAll("[data-stroke-anchor][data-reveal-id]"),
  );
  const rootRect = root.getBoundingClientRect();
  const width = Math.max(1, root.clientWidth);
  const height = Math.max(root.scrollHeight, Math.ceil(rootRect.height));
  const isNarrow = width < 768;

  if (anchors.length < 2) {
    return null;
  }

  const measuredPoints = anchors
    .map((element, index) => ({
      ...getStrokePoint(element, rootRect, width, height, isNarrow),
      index,
    }))
    .filter((point) => point.id)
    .sort((a, b) => a.y - b.y || a.index - b.index);

  const routePoints = buildRoutePoints(measuredPoints, width, height, isNarrow);
  const segments = buildSegments(routePoints, isNarrow);
  const samples = sampleSegments(segments);
  const strokeWidth = isNarrow ? 30 : 58;

  return {
    corePath: buildCorePath(samples, strokeWidth),
    darkBand: getDarkBand(root, rootRect, width, height),
    haloPath: buildCorePath(samples, strokeWidth * 1.9),
    height,
    innerCorePath: buildCorePath(samples, strokeWidth * 0.58),
    maskPath: buildMaskPath(segments),
    strandPaths: BRISTLE_STRANDS.map((strand) =>
      buildStrandPath(samples, strokeWidth, strand),
    ),
    strokeWidth,
    thresholds: buildThresholds(measuredPoints, routePoints, window.innerHeight),
    width,
  };
}

function geometryChanged(previous, next) {
  if (!previous || !next) {
    return previous !== next;
  }

  return (
    previous.corePath !== next.corePath ||
    previous.maskPath !== next.maskPath ||
    previous.width !== next.width ||
    previous.height !== next.height ||
    JSON.stringify(previous.darkBand) !== JSON.stringify(next.darkBand) ||
    JSON.stringify(previous.thresholds) !== JSON.stringify(next.thresholds)
  );
}

function sameIds(previous, nextIds) {
  if (previous.size !== nextIds.length) {
    return false;
  }

  return nextIds.every((id) => previous.has(id));
}

function getPathLength(path) {
  if (!path || typeof path.getTotalLength !== "function") {
    return 1;
  }

  return Math.max(path.getTotalLength(), 1);
}

export function MakeupStrokeProvider({ children }) {
  const [motionActive, setMotionActive] = useState(false);
  const [revealedIds, setRevealedIdsState] = useState(() => new Set());

  const setRevealedIds = useCallback((ids) => {
    setRevealedIdsState((previous) =>
      sameIds(previous, ids) ? previous : new Set(ids),
    );
  }, []);

  const value = useMemo(
    () => ({
      motionActive,
      revealedIds,
      setMotionActive,
      setRevealedIds,
    }),
    [motionActive, revealedIds, setRevealedIds],
  );

  return (
    <MakeupStrokeContext.Provider value={value}>
      {children}
    </MakeupStrokeContext.Provider>
  );
}

export function useMakeupStrokeReveal(id) {
  const { motionActive, revealedIds } = useContext(MakeupStrokeContext);

  return !motionActive || revealedIds.has(id);
}

function BrushArtwork({ core, halo, inner, strands, smudgeFilter, haloFilter }) {
  return (
    <>
      <path d={halo.d} fill={halo.color} filter={haloFilter} opacity={halo.opacity} />
      <path d={core.d} fill={core.color} filter={smudgeFilter} opacity={core.opacity} />
      <path d={inner.d} fill={inner.color} filter={smudgeFilter} opacity={inner.opacity} />
      {BRISTLE_STRANDS.map((strand, index) => (
        <path
          d={strands.paths[index]}
          fill="none"
          key={strand.seed}
          opacity={strand.opacity * strands.opacityScale}
          stroke={strands.color}
          strokeDasharray={strand.dash}
          strokeWidth={strands.strokeWidth * strand.width}
        />
      ))}
    </>
  );
}

export default function MakeupStroke() {
  const layerRef = useRef(null);
  const maskPathRef = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { setMotionActive, setRevealedIds } = useContext(MakeupStrokeContext);
  const rawId = useId();
  const svgId = useMemo(() => rawId.replace(/:/g, ""), [rawId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const root = layer?.closest("[data-makeup-root]");

    if (!root) {
      return undefined;
    }

    let frameId = 0;

    const measure = () => {
      frameId = 0;
      const nextGeometry = getGeometry(root);

      setGeometry((previous) =>
        geometryChanged(previous, nextGeometry) ? nextGeometry : previous,
      );
    };

    const requestFrame =
      typeof requestAnimationFrame === "undefined"
        ? (callback) => window.setTimeout(callback, 16)
        : requestAnimationFrame;
    const cancelFrame =
      typeof cancelAnimationFrame === "undefined"
        ? window.clearTimeout
        : cancelAnimationFrame;

    const scheduleMeasure = () => {
      if (frameId) {
        cancelFrame(frameId);
      }

      frameId = requestFrame(measure);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);

    if (resizeObserver) {
      resizeObserver.observe(root);
      root
        .querySelectorAll("[data-stroke-anchor][data-reveal-id]")
        .forEach((element) => resizeObserver.observe(element));
    }

    window.addEventListener("resize", scheduleMeasure);
    document.fonts?.ready?.then(scheduleMeasure);
    scheduleMeasure();

    return () => {
      if (frameId) {
        cancelFrame(frameId);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, []);

  useGSAP(
    () => {
      const root = layerRef.current?.closest("[data-makeup-root]");
      const maskPath = maskPathRef.current;

      setMotionActive(false);

      if (!root || !geometry || !maskPath) {
        return undefined;
      }

      const length = getPathLength(maskPath);
      // Pad the dash pattern so no dash/gap boundary sits exactly at the path
      // start when fully undrawn — a zero-length dash with round caps renders
      // as a stray dot at the stroke tip.
      const pad = geometry.strokeWidth * 2;

      gsap.set(maskPath, {
        strokeDasharray: `${length + pad} ${length + pad * 2}`,
        strokeDashoffset: prefersReducedMotion ? 0 : length + pad * 1.5,
        visibility: "visible",
      });

      if (prefersReducedMotion) {
        return undefined;
      }

      const applyProgress = (progress) => {
        const visibleIds = geometry.thresholds
          .filter(({ threshold }) => progress + 0.004 >= threshold)
          .map(({ id }) => id);

        setRevealedIds(visibleIds);
      };

      const tween = gsap.to(maskPath, {
        ease: "none",
        scrollTrigger: {
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            applyProgress(self.progress);
          },
          onUpdate: (self) => {
            applyProgress(self.progress);
          },
          scrub: 0.32,
          start: "top top",
          trigger: root,
        },
        strokeDashoffset: 0,
      });

      ScrollTrigger.refresh();
      applyProgress(tween.scrollTrigger?.progress || 0);
      setMotionActive(true);

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        setMotionActive(false);
      };
    },
    {
      dependencies: [geometry, prefersReducedMotion, setMotionActive, setRevealedIds],
      revertOnUpdate: true,
      scope: layerRef,
    },
  );

  if (!geometry) {
    return <div ref={layerRef} aria-hidden="true" />;
  }

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] overflow-hidden"
      style={{ height: `${geometry.height}px` }}
    >
      <svg
        className="block h-full w-full"
        focusable="false"
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        width={geometry.width}
      >
        <defs>
          <filter
            id={`${svgId}-smudge`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              baseFrequency="0.009 0.055"
              numOctaves="2"
              result="texture"
              seed="14"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="texture"
              result="displaced"
              scale={geometry.strokeWidth * 0.13}
            />
            <feGaussianBlur
              in="displaced"
              stdDeviation={geometry.strokeWidth * 0.02}
            />
          </filter>
          <filter
            id={`${svgId}-halo`}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
          >
            <feGaussianBlur stdDeviation={geometry.strokeWidth * 0.4} />
          </filter>
          {geometry.darkBand ? (
            <clipPath
              id={`${svgId}-dark-band`}
              clipPathUnits="userSpaceOnUse"
            >
              <rect
                height={geometry.darkBand.height}
                width={geometry.darkBand.width}
                x={geometry.darkBand.x}
                y={geometry.darkBand.y}
              />
            </clipPath>
          ) : null}
          <mask
            id={`${svgId}-draw`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={geometry.width}
            height={geometry.height}
          >
            <path
              ref={maskPathRef}
              d={geometry.maskPath}
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={geometry.strokeWidth * 3.4}
              style={{ visibility: "hidden" }}
            />
          </mask>
        </defs>

        <g mask={`url(#${svgId}-draw)`}>
          <BrushArtwork
            core={{
              color: "var(--color-accent)",
              d: geometry.corePath,
              opacity: 0.5,
            }}
            halo={{
              color: "var(--color-blush)",
              d: geometry.haloPath,
              opacity: 0.2,
            }}
            haloFilter={`url(#${svgId}-halo)`}
            inner={{
              color: "var(--color-accent-deep)",
              d: geometry.innerCorePath,
              opacity: 0.2,
            }}
            smudgeFilter={`url(#${svgId}-smudge)`}
            strands={{
              color: "var(--color-accent-deep)",
              opacityScale: 1,
              paths: geometry.strandPaths,
              strokeWidth: geometry.strokeWidth,
            }}
          />
        </g>

        {geometry.darkBand ? (
          <g
            clipPath={`url(#${svgId}-dark-band)`}
            mask={`url(#${svgId}-draw)`}
          >
            <BrushArtwork
              core={{
                color: "var(--color-surface)",
                d: geometry.corePath,
                opacity: 0.72,
              }}
              halo={{
                color: "var(--color-peach)",
                d: geometry.haloPath,
                opacity: 0.16,
              }}
              haloFilter={`url(#${svgId}-halo)`}
              inner={{
                color: "var(--color-surface)",
                d: geometry.innerCorePath,
                opacity: 0.35,
              }}
              smudgeFilter={`url(#${svgId}-smudge)`}
              strands={{
                color: "var(--color-peach)",
                opacityScale: 0.9,
                paths: geometry.strandPaths,
                strokeWidth: geometry.strokeWidth,
              }}
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
