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

function buildStrokePath(points, isNarrow) {
  const tension = isNarrow ? 0.48 : 0.54;
  const [firstPoint, ...restPoints] = points;

  return restPoints.reduce((path, point, index) => {
    const previous = points[index];
    const deltaY = Math.max(28, point.y - previous.y);
    const c1Y = previous.y + deltaY * tension;
    const c2Y = point.y - deltaY * tension;

    return `${path} C ${previous.x.toFixed(1)} ${c1Y.toFixed(1)}, ${point.x.toFixed(
      1,
    )} ${c2Y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, `M ${firstPoint.x.toFixed(1)} ${firstPoint.y.toFixed(1)}`);
}

function buildThresholds(pathPoints, viewportHeight) {
  const cumulativeDistances = [0];
  let totalDistance = 0;

  for (let index = 1; index < pathPoints.length; index += 1) {
    totalDistance += distance(pathPoints[index - 1], pathPoints[index]);
    cumulativeDistances[index] = totalDistance;
  }

  const initialViewportLine = viewportHeight * 0.78;

  return pathPoints
    .map((point, index) => {
      if (!point.id) {
        return null;
      }

      return {
        id: point.id,
        threshold:
          point.y <= initialViewportLine
            ? 0
            : clamp(cumulativeDistances[index] / Math.max(totalDistance, 1), 0, 1),
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

  const first = measuredPoints[0];
  const last = measuredPoints[measuredPoints.length - 1];
  const pathPoints = [
    {
      x: first.x,
      y: clamp(first.y - (isNarrow ? 78 : 118), 18, height),
    },
    ...measuredPoints,
    {
      x: last.x,
      y: clamp(last.y + (isNarrow ? 112 : 170), 18, height - 18),
    },
  ];

  return {
    darkBand: getDarkBand(root, rootRect, width, height),
    height,
    path: buildStrokePath(pathPoints, isNarrow),
    strokeWidth: isNarrow ? 16 : 20,
    thresholds: buildThresholds(pathPoints, window.innerHeight),
    width,
  };
}

function geometryChanged(previous, next) {
  if (!previous || !next) {
    return previous !== next;
  }

  return (
    previous.path !== next.path ||
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

export default function MakeupStroke() {
  const layerRef = useRef(null);
  const blushPathRef = useRef(null);
  const accentPathRef = useRef(null);
  const edgePathRef = useRef(null);
  const lightPathRef = useRef(null);
  const lightEdgePathRef = useRef(null);
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
      const animatedPaths = [
        blushPathRef.current,
        accentPathRef.current,
        edgePathRef.current,
        lightPathRef.current,
        lightEdgePathRef.current,
      ].filter(Boolean);

      setMotionActive(false);

      if (!root || !geometry || animatedPaths.length === 0) {
        return undefined;
      }

      gsap.set(animatedPaths, {
        strokeDasharray: 1,
        strokeDashoffset: prefersReducedMotion ? 0 : 1,
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

      const tween = gsap.to(animatedPaths, {
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

  const dashStyle = {
    strokeDasharray: 1,
    strokeDashoffset: prefersReducedMotion ? 0 : 1,
  };

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
              baseFrequency="0.012 0.09"
              numOctaves="2"
              result="texture"
              seed="14"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="texture"
              scale={geometry.strokeWidth * 0.16}
            />
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
        </defs>

        <path
          ref={blushPathRef}
          d={geometry.path}
          fill="none"
          filter={`url(#${svgId}-smudge)`}
          opacity="0.36"
          pathLength="1"
          stroke="var(--color-blush)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={geometry.strokeWidth * 1.55}
          style={dashStyle}
        />
        <path
          ref={accentPathRef}
          d={geometry.path}
          fill="none"
          opacity="0.74"
          pathLength="1"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={geometry.strokeWidth}
          style={dashStyle}
        />
        <path
          ref={edgePathRef}
          d={geometry.path}
          fill="none"
          opacity="0.64"
          pathLength="1"
          stroke="var(--color-accent-deep)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={geometry.strokeWidth * 0.34}
          style={dashStyle}
        />

        {geometry.darkBand ? (
          <g clipPath={`url(#${svgId}-dark-band)`}>
            <path
              ref={lightPathRef}
              d={geometry.path}
              fill="none"
              opacity="0.88"
              pathLength="1"
              stroke="var(--color-surface)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={geometry.strokeWidth * 0.82}
              style={dashStyle}
            />
            <path
              ref={lightEdgePathRef}
              d={geometry.path}
              fill="none"
              opacity="0.62"
              pathLength="1"
              stroke="var(--color-peach)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={geometry.strokeWidth * 0.26}
              style={dashStyle}
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
