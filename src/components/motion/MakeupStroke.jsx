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

const SAMPLES_PER_SEGMENT = 36;

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
    Math.sin(t * 31 + seed * 2.7) * 0.42 +
    Math.sin(t * 73 + seed * 5.3) * 0.26 +
    Math.sin(t * 12 + seed) * 0.16 +
    Math.sin(t * 214 + seed * 1.7) * 0.16
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

// The stroke is rendered as independently fadeable arc-length chunks instead
// of one dash-scrubbed mask. Scrubbing a dashoffset invalidates the entire
// path's paint on every scroll frame; fading small chunks keeps repaint
// damage local to the stroke tip so scrolling stays compositor-driven.
function buildChunks(samples, strokeWidth, isNarrow) {
  const totalLength = samples[samples.length - 1].travelled;
  const targetLength = isNarrow ? 150 : 190;
  const count = clamp(Math.round(totalLength / targetLength), 8, 80);
  const chunks = [];
  let startIndex = 0;

  for (let chunkIndex = 1; chunkIndex <= count; chunkIndex += 1) {
    const limit = chunkIndex / count;
    let endIndex = startIndex;

    while (endIndex < samples.length - 1 && samples[endIndex].t < limit) {
      endIndex += 1;
    }

    if (endIndex - startIndex < 1) {
      continue;
    }

    const slice = samples.slice(startIndex, endIndex + 1);
    let minY = Infinity;
    let maxY = -Infinity;

    slice.forEach((sample) => {
      minY = Math.min(minY, sample.y);
      maxY = Math.max(maxY, sample.y);
    });

    chunks.push({
      corePath: buildCorePath(slice, strokeWidth),
      haloPaths: [
        buildCorePath(slice, strokeWidth * 2.1),
        buildCorePath(slice, strokeWidth * 1.5),
      ],
      innerPath: buildCorePath(slice, strokeWidth * 0.58),
      maxY: maxY + strokeWidth * 1.2,
      minY: minY - strokeWidth * 1.2,
      strandPaths: BRISTLE_STRANDS.map((strand) =>
        buildStrandPath(slice, strokeWidth, strand),
      ),
      threshold: slice[0].t,
    });

    startIndex = endIndex;
  }

  return chunks;
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
  const chunks = buildChunks(samples, strokeWidth, isNarrow);

  return {
    chunkFade: 1.6 / Math.max(chunks.length, 1),
    chunks,
    darkBand: getDarkBand(root, rootRect, width, height),
    height,
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
    previous.width !== next.width ||
    previous.height !== next.height ||
    previous.chunks.length !== next.chunks.length ||
    previous.chunks[0]?.corePath !== next.chunks[0]?.corePath ||
    previous.chunks[previous.chunks.length - 1]?.corePath !==
      next.chunks[next.chunks.length - 1]?.corePath ||
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

// Flat fills and strokes only — no SVG filters. Filtered groups are
// re-rasterized on the CPU whenever their paint is invalidated, which is what
// made scrolling drop frames.
function BrushChunk({ chunk, core, haloColor, haloOpacities, inner, strands }) {
  return (
    <>
      {chunk.haloPaths.map((d, index) => (
        <path
          d={d}
          fill={haloColor}
          key={d.slice(0, 24)}
          opacity={haloOpacities[index]}
          stroke={haloColor}
          strokeWidth="1"
        />
      ))}
      <path
        d={chunk.corePath}
        fill={core.color}
        opacity={core.opacity}
        stroke={core.color}
        strokeWidth="1"
      />
      <path
        d={chunk.innerPath}
        fill={inner.color}
        opacity={inner.opacity}
        stroke={inner.color}
        strokeWidth="1"
      />
      {BRISTLE_STRANDS.map((strand, index) => (
        <path
          d={chunk.strandPaths[index]}
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

const MAIN_COLORS = {
  core: { color: "var(--color-accent)", opacity: 0.5 },
  haloColor: "var(--color-blush)",
  haloOpacities: [0.08, 0.12],
  inner: { color: "var(--color-accent-deep)", opacity: 0.2 },
};

const LIGHT_COLORS = {
  core: { color: "var(--color-surface)", opacity: 0.72 },
  haloColor: "var(--color-peach)",
  haloOpacities: [0.06, 0.1],
  inner: { color: "var(--color-surface)", opacity: 0.35 },
};

export default function MakeupStroke() {
  const layerRef = useRef(null);
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
      const layer = layerRef.current;
      const root = layer?.closest("[data-makeup-root]");

      setMotionActive(false);

      if (!root || !geometry || !layer) {
        return undefined;
      }

      const chunkItems = Array.from(
        layer.querySelectorAll("[data-stroke-chunk]"),
      ).map((element) => ({
        element,
        lastValue: null,
        threshold: Number.parseFloat(element.dataset.strokeThreshold || "0"),
      }));

      const setChunkOpacities = (progress) => {
        chunkItems.forEach((item) => {
          const raw = clamp(
            (progress + 0.002 - item.threshold) / geometry.chunkFade,
            0,
            1,
          );
          const value = Math.round(raw * 100) / 100;

          if (value !== item.lastValue) {
            item.lastValue = value;
            item.element.style.opacity = String(value);
          }
        });
      };

      if (prefersReducedMotion) {
        chunkItems.forEach((item) => {
          item.element.style.opacity = "1";
        });

        return undefined;
      }

      const applyProgress = (progress) => {
        setChunkOpacities(progress);

        const visibleIds = geometry.thresholds
          .filter(({ threshold }) => progress + 0.004 >= threshold)
          .map(({ id }) => id);

        setRevealedIds(visibleIds);
      };

      const trigger = ScrollTrigger.create({
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          applyProgress(self.progress);
        },
        onUpdate: (self) => {
          applyProgress(self.progress);
        },
        start: "top top",
        trigger: root,
      });

      applyProgress(trigger.progress || 0);
      setMotionActive(true);

      return () => {
        trigger.kill();
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

  const darkBand = geometry.darkBand;
  const lightChunks = darkBand
    ? geometry.chunks.filter(
        (chunk) =>
          chunk.maxY >= darkBand.y && chunk.minY <= darkBand.y + darkBand.height,
      )
    : [];

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] transform-gpu overflow-hidden will-change-transform"
      style={{ height: `${geometry.height}px` }}
    >
      <svg
        className="block h-full w-full"
        focusable="false"
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        width={geometry.width}
      >
        {darkBand ? (
          <defs>
            <clipPath
              id={`${svgId}-dark-band`}
              clipPathUnits="userSpaceOnUse"
            >
              <rect
                height={darkBand.height}
                width={darkBand.width}
                x={darkBand.x}
                y={darkBand.y}
              />
            </clipPath>
          </defs>
        ) : null}

        {geometry.chunks.map((chunk) => (
          <g
            data-stroke-chunk="true"
            data-stroke-threshold={chunk.threshold}
            key={chunk.threshold}
            style={{ opacity: 0 }}
          >
            <BrushChunk
              chunk={chunk}
              {...MAIN_COLORS}
              strands={{
                color: "var(--color-accent-deep)",
                opacityScale: 1,
                strokeWidth: geometry.strokeWidth,
              }}
            />
          </g>
        ))}

        {darkBand ? (
          <g clipPath={`url(#${svgId}-dark-band)`}>
            {lightChunks.map((chunk) => (
              <g
                data-stroke-chunk="true"
                data-stroke-threshold={chunk.threshold}
                key={chunk.threshold}
                style={{ opacity: 0 }}
              >
                <BrushChunk
                  chunk={chunk}
                  {...LIGHT_COLORS}
                  strands={{
                    color: "var(--color-peach)",
                    opacityScale: 0.9,
                    strokeWidth: geometry.strokeWidth,
                  }}
                />
              </g>
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
