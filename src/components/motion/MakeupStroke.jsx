"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function createMakeupStrokeStore(initialMotionActive = true) {
  let motionActive = initialMotionActive;
  let revealedIds = new Set();
  // React requires getServerSnapshot to remain referentially stable between
  // renders. The live revealed set is intentionally excluded so scroll
  // updates never mutate the server/hydration snapshot.
  const serverVisibility = !initialMotionActive;
  const listeners = new Set();

  const subscribe = (listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setMotionActive = (nextValue) => {
    const next =
      typeof nextValue === "function" ? nextValue(motionActive) : nextValue;

    if (motionActive === next) {
      return;
    }

    motionActive = next;
    notify();
  };

  const setRevealedIds = (ids) => {
    const nextIds = Array.from(ids || []);

    if (sameIds(revealedIds, nextIds)) {
      return;
    }

    revealedIds = new Set(nextIds);
    notify();
  };

  return {
    getServerVisibility: () => serverVisibility,
    getVisibility: (id) => !motionActive || revealedIds.has(id),
    setMotionActive,
    setRevealedIds,
    subscribe,
  };
}

const fallbackMakeupStrokeStore = createMakeupStrokeStore(false);
const MakeupStrokeContext = createContext({
  setMotionActive: () => {},
  setRevealedIds: () => {},
  store: fallbackMakeupStrokeStore,
});

const SAMPLES_PER_SEGMENT = 48;

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
    boundary: element.dataset.strokeBoundary === "true",
    id: element.dataset.revealId,
    side,
    x: clamp(x, inset, rootWidth - inset),
    y: clamp(
      rect.top - rootRect.top + rect.height * clamp(yRatio, 0.12, 0.88),
      24,
      rootHeight - 24,
    ),
  };
}

function sideDirection(side) {
  if (side === "start" || side === "outer-start") {
    return -1;
  }

  if (side === "end" || side === "outer-end") {
    return 1;
  }

  return null;
}

function buildRoutePoints(measuredPoints, width, height, isNarrow) {
  if (!measuredPoints.length) {
    return [];
  }

  const groupingDistance = isNarrow ? 360 : 340;
  const sideInset = isNarrow
    ? clamp(width * 0.09, 28, 56)
    : clamp(width * 0.08, 72, 140);
  const corridorInset = isNarrow
    ? clamp(width * 0.22, 64, 94)
    : sideInset + clamp(width * 0.03, 10, 18);
  const narrowCorridorEdge = width * 0.46;
  const groups = [];

  measuredPoints.forEach((point) => {
    const group = groups[groups.length - 1];
    const direction = isNarrow ? sideDirection(point.side) : null;
    const directionConflict =
      isNarrow &&
      group &&
      direction !== null &&
      group.direction !== null &&
      group.direction !== direction;

    if (
      !group ||
      point.boundary ||
      group.boundary ||
      point.y - group.startY > groupingDistance ||
      directionConflict
    ) {
      groups.push({
        boundary: point.boundary,
        direction,
        outerTarget: point.side === "outer-end",
        points: [point],
        startY: point.y,
      });
      return;
    }

    group.points.push(point);
    if (point.side === "outer-end") {
      group.outerTarget = true;
    }

    if (group.direction === null && direction !== null) {
      group.direction = direction;
    }
  });

  const routePoints = groups.flatMap((group, index) => {
    const directionalPoints =
      isNarrow && group.direction !== null
        ? group.points.filter(
            (point) => sideDirection(point.side) === group.direction,
          )
        : group.points;
    const points = directionalPoints.length ? directionalPoints : group.points;
    const averageX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const averageY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const previous = index > 0 ? groups[index - 1].routePoint : null;
    let corridorX = averageX;

    if (isNarrow && group.direction === -1) {
      corridorX = clamp(averageX, corridorInset, narrowCorridorEdge);
    }

    if (isNarrow && group.direction === 1) {
      corridorX = clamp(averageX, width - narrowCorridorEdge, width - corridorInset);
    }

    const directionChanged =
      isNarrow &&
      previous &&
      previous.direction !== null &&
      group.direction !== null &&
      previous.direction !== group.direction;
    const routeY = isNarrow
      ? clamp(
          Math.max(averageY, previous?.y ?? 24),
          24,
          height - 24,
        )
      : clamp(averageY, 24, height - 24);

    const turnGap = previous ? routeY - previous.y : 0;
    const hasDirectionTurn = directionChanged && turnGap >= 2;
    const isSparseTurn = hasDirectionTurn && turnGap >= 260;
    const turnPoint = hasDirectionTurn
      ? {
          direction: group.direction,
          x: clamp(
            isSparseTurn
              ? previous.x
              : previous.x * 0.58 + corridorX * 0.42,
            sideInset,
            width - sideInset,
          ),
          y: previous.y + turnGap * (isSparseTurn ? 0.25 : 0.5),
        }
      : null;
    const approachPoint = isSparseTurn
      ? {
          direction: group.direction,
          x: clamp(
            previous.x * 0.5 + corridorX * 0.5,
            sideInset,
            width - sideInset,
          ),
          y: previous.y + turnGap * 0.7,
        }
      : null;

    // Keep narrow-screen turns visibly lateral while carrying each change
    // through an easing corridor. Large gaps retain the old corridor first,
    // approach halfway toward the new side, then arrive near its edge.
    const endpointTargetWeight = isSparseTurn
      ? 0.8
      : group.outerTarget
        ? 0.84
        : 0.65;
    const softenedX = previous
      ? hasDirectionTurn
        ? previous.x * (1 - endpointTargetWeight) +
          corridorX * endpointTargetWeight
        : previous.x * (isNarrow ? 0.72 : 0.24) +
          corridorX * (isNarrow ? 0.28 : 0.76)
      : corridorX;
    const routePoint = {
      x: clamp(softenedX, sideInset, width - sideInset),
      y: routeY,
    };

    if (isNarrow) {
      routePoint.direction = group.direction;
    }

    group.routePoint = routePoint;
    return approachPoint
      ? [turnPoint, approachPoint, routePoint]
      : turnPoint
        ? [turnPoint, routePoint]
        : [routePoint];
  });

  const first = routePoints[0];
  const last = routePoints[routePoints.length - 1];
  const startsAtBoundary = groups[0]?.boundary;
  const terminalX =
    isNarrow && last.direction === 1
      ? clamp(Math.max(last.x, width - corridorInset), sideInset, width - sideInset)
      : last.x;

  return [
    ...(startsAtBoundary
      ? []
      : [
          {
            x: first.x,
            y: clamp(first.y - (isNarrow ? 150 : 220), 18, height),
          },
        ]),
    ...routePoints,
    {
      // Let the final outer-end approach keep a gentle rightward tangent
      // instead of snapping into a vertical tail at the existing endpoint.
      x: terminalX,
      y: clamp(last.y + (isNarrow ? 180 : 220), 18, height - 18),
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
//
// Chunks must be smaller than the stroke is wide and the fade window must
// span several of them, or the draw-on reads as segments popping in instead
// of a continuous tip. Transverse cuts through translucent fills leave a
// faint antialiasing seam, so the layer stack is split across TWO chunk sets
// whose boundaries are offset by half a chunk: every seam in one set sits
// under the continuous middle of the other set, and the core is drawn as two
// stacked half-opacity copies (one per set) so no single seam ever cuts the
// full core density.
function buildChunkSet(samples, strokeWidth, count, half, layers) {
  const cuts = [];

  for (let k = 0; k < count; k += 1) {
    const cut = (k + half) / count;

    if (cut > 0 && cut < 1) {
      cuts.push(cut);
    }
  }

  cuts.push(1);

  const chunks = [];
  let startIndex = 0;

  cuts.forEach((limit) => {
    let endIndex = startIndex;

    while (endIndex < samples.length - 1 && samples[endIndex].t < limit) {
      endIndex += 1;
    }

    if (endIndex - startIndex < 1) {
      return;
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
      haloPath: buildCorePath(slice, strokeWidth * layers.haloScale),
      innerPath: layers.inner
        ? buildCorePath(slice, strokeWidth * 0.58)
        : null,
      maxY: maxY + strokeWidth * 1.2,
      minY: minY - strokeWidth * 1.2,
      startY: slice[0].y,
      strandPaths: layers.strandIndices.map((strandIndex) => ({
        d: buildStrandPath(slice, strokeWidth, BRISTLE_STRANDS[strandIndex]),
        strandIndex,
      })),
      threshold: 0,
    });

    startIndex = endIndex;
  });

  return chunks;
}

function buildChunkSets(samples, strokeWidth, isNarrow) {
  const totalLength = samples[samples.length - 1].travelled;
  const targetLength = isNarrow ? 56 : 48;
  const count = clamp(Math.round(totalLength / targetLength), 12, 260);

  return {
    count,
    sets: [
      buildChunkSet(samples, strokeWidth, count, 0, {
        haloScale: 2.1,
        inner: false,
        strandIndices: [0, 2, 4],
      }),
      buildChunkSet(samples, strokeWidth, count, 0.5, {
        haloScale: 1.5,
        inner: true,
        strandIndices: [1, 3, 5],
      }),
    ],
  };
}

// Thresholds are keyed to page y instead of arc length. ScrollTrigger
// progress is a fraction of the scrollable page, so an arc-length threshold
// desynchronizes wherever the path packs extra length into little vertical
// distance — the drawn front fell behind the viewport in the curvy early
// sections and "caught up" later. Mapping y against a viewport line keeps
// the front pinned ~88% down the screen everywhere, and text reveals share
// the same mapping so they stay in sync with the stroke tip.
function progressAtY(y, lead, denominator) {
  return clamp((y - lead) / denominator, 0, 1);
}

function buildThresholds(revealPoints, lead, denominator) {
  return revealPoints
    .map((point) => {
      if (!point.id) {
        return null;
      }

      return {
        id: point.id,
        threshold: progressAtY(point.y, lead, denominator),
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
  // Measure the root's layout box, not its scrollable overflow. The absolute
  // stroke layer is sized from this value and may itself contribute to
  // scrollHeight; feeding that overflow back into the next measurement can
  // repeatedly lengthen the page after copy reflows, such as a language switch.
  const height = Math.max(1, Math.ceil(rootRect.height));
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

  const boundaryIndex = measuredPoints.findIndex((point) => point.boundary);
  const routeMeasuredPoints =
    boundaryIndex >= 0 ? measuredPoints.slice(boundaryIndex) : measuredPoints;

  if (routeMeasuredPoints.length < 2) {
    return null;
  }

  const startsAtBoundary = routeMeasuredPoints[0]?.boundary === true;
  const routePoints = buildRoutePoints(
    routeMeasuredPoints,
    width,
    height,
    isNarrow,
  );

  if (routePoints.length < 2) {
    return null;
  }

  const segments = buildSegments(routePoints, isNarrow);
  const samples = sampleSegments(segments);
  const strokeWidth = isNarrow ? 30 : 58;
  const chunkSets = buildChunkSets(samples, strokeWidth, isNarrow);
  const viewportHeight = window.innerHeight;
  const lead = viewportHeight * 0.88;
  const endY = samples[samples.length - 1].y;
  const denominator = Math.max(endY - lead, 1);
  const curtain = root.querySelector("[data-hero-curtain]");
  const curtainHero = curtain?.querySelector("[data-hero-curtain-hero]");
  const curtainDepth = Number.parseFloat(
    curtain?.dataset.heroCurtainRevealDepth || "NaN",
  );
  const curtainBoundary = curtainHero
    ? curtainHero.getBoundingClientRect().bottom - rootRect.top
    : Number.NaN;
  const curtainTop =
    Number.isFinite(curtainBoundary) && Number.isFinite(curtainDepth)
      ? curtainBoundary - curtainDepth
      : Number.NaN;

  // Intro ramp: at progress 0 the stroke is undrawn. Over the first ~1.2
  // viewports of scrolling the front sweeps from the path's start slightly
  // faster than the scroll until it catches the 0.88-viewport tracking line,
  // then follows it. The two mappings meet exactly at catchY, so the
  // handoff is continuous.
  const pathStartY = samples[0].y;
  const scrollable = Math.max(height - viewportHeight, 1);
  const rampProgress = clamp((viewportHeight * 1.2) / scrollable, 0.02, 0.35);
  const catchY = lead + rampProgress * denominator;
  const chunkThreshold = (y) => {
    if (startsAtBoundary) {
      return progressAtY(y, lead, denominator);
    }

    if (y <= pathStartY + 1) {
      return 0;
    }

    if (y < catchY) {
      return (
        (rampProgress * (y - pathStartY)) / Math.max(catchY - pathStartY, 1)
      );
    }

    return progressAtY(y, lead, denominator);
  };

  chunkSets.sets.forEach((chunks) => {
    chunks.forEach((chunk) => {
      chunk.threshold = chunkThreshold(chunk.startY);
    });
  });

  return {
    // Tip fade length in page pixels, expressed in progress units.
    chunkFade: (isNarrow ? 180 : 210) / denominator,
    chunkSets: chunkSets.sets,
    curtainBand:
      Number.isFinite(curtainTop) && Number.isFinite(curtainBoundary)
        ? { bottom: curtainBoundary, top: curtainTop }
        : null,
    darkBand: getDarkBand(root, rootRect, width, height),
    height,
    strokeWidth,
    thresholds: buildThresholds(measuredPoints, lead, denominator),
    width,
  };
}

function geometryChanged(previous, next) {
  if (!previous || !next) {
    return previous !== next;
  }

  const previousChunks = previous.chunkSets[0];
  const nextChunks = next.chunkSets[0];

  return (
    previous.width !== next.width ||
    previous.height !== next.height ||
    previousChunks.length !== nextChunks.length ||
    previousChunks[0]?.corePath !== nextChunks[0]?.corePath ||
    previousChunks[previousChunks.length - 1]?.corePath !==
      nextChunks[nextChunks.length - 1]?.corePath ||
    JSON.stringify(previous.curtainBand) !==
      JSON.stringify(next.curtainBand) ||
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
  const store = useMemo(() => createMakeupStrokeStore(), []);

  const value = useMemo(
    () => ({
      setMotionActive: store.setMotionActive,
      setRevealedIds: store.setRevealedIds,
      store,
    }),
    [store],
  );

  return (
    <MakeupStrokeContext.Provider value={value}>
      {children}
    </MakeupStrokeContext.Provider>
  );
}

export function useMakeupStrokeReveal(id) {
  const { store } = useContext(MakeupStrokeContext);

  return useSyncExternalStore(
    store.subscribe,
    () => store.getVisibility(id),
    () => store.getServerVisibility(id),
  );
}

// Flat fills and strokes only — no SVG filters. Filtered groups are
// re-rasterized on the CPU whenever their paint is invalidated, which is what
// made scrolling drop frames. Core opacities are per-copy: the two staggered
// chunk sets each draw the core once, compositing to the intended density
// (1 - (1 - a)^2).
function BrushChunk({ chunk, palette, setIndex, strokeWidth }) {
  return (
    <>
      <path
        d={chunk.haloPath}
        fill={palette.haloColor}
        opacity={palette.haloOpacities[setIndex]}
      />
      <path
        d={chunk.corePath}
        fill={palette.coreColor}
        opacity={palette.coreOpacity}
      />
      {chunk.innerPath ? (
        <path
          d={chunk.innerPath}
          fill={palette.innerColor}
          opacity={palette.innerOpacity}
        />
      ) : null}
      {chunk.strandPaths.map(({ d, strandIndex }) => {
        const strand = BRISTLE_STRANDS[strandIndex];

        return (
          <path
            d={d}
            fill="none"
            key={strand.seed}
            opacity={strand.opacity * palette.strandOpacityScale}
            stroke={palette.strandColor}
            strokeDasharray={strand.dash}
            strokeWidth={strokeWidth * strand.width}
          />
        );
      })}
    </>
  );
}

const MAIN_PALETTE = {
  coreColor: "var(--color-accent)",
  coreOpacity: 0.293,
  haloColor: "var(--color-blush)",
  haloOpacities: [0.08, 0.12],
  innerColor: "var(--color-accent-deep)",
  innerOpacity: 0.2,
  strandColor: "var(--color-accent-deep)",
  strandOpacityScale: 1,
};

const LIGHT_PALETTE = {
  coreColor: "var(--color-blush)",
  coreOpacity: 0.471,
  haloColor: "var(--color-peach)",
  haloOpacities: [0.06, 0.1],
  innerColor: "var(--color-blush)",
  innerOpacity: 0.35,
  strandColor: "var(--color-peach)",
  strandOpacityScale: 0.9,
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

    let disposed = false;
    let frameId = 0;

    const measure = () => {
      frameId = 0;

      if (disposed) {
        return;
      }

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
      if (disposed) {
        return;
      }

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
    root.addEventListener("hero-curtain:measure", scheduleMeasure);
    document.fonts?.ready?.then(scheduleMeasure);
    scheduleMeasure();

    return () => {
      disposed = true;

      if (frameId) {
        cancelFrame(frameId);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      root.removeEventListener("hero-curtain:measure", scheduleMeasure);
    };
  }, []);

  useGSAP(
    () => {
      const layer = layerRef.current;
      const root = layer?.closest("[data-makeup-root]");

      if (!root || !layer) {
        // With no measurable controller there is no scroll lifecycle to
        // conceal content behind. Keep the progressive-enhancement fallback
        // visible until a real controller can be installed.
        setMotionActive(false);
        return undefined;
      }

      // Geometry is populated on the first measured animation frame. Keep the
      // store's initial motion-active snapshot during that transient gap so
      // every Reveal does not flash visible and then conceal again on mount.
      if (!geometry) {
        return undefined;
      }

      // This is the intentional controller state. It is set during setup,
      // never during cleanup, so revertOnUpdate cannot briefly expose every
      // reveal as a reduced-motion fallback while geometry is re-initialized.
      setMotionActive(!prefersReducedMotion);

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
          // Smoothstep so the tip's leading edge dies off gently instead of
          // showing a linear patchwork of part-faded chunks.
          const eased = raw * raw * (3 - 2 * raw);
          const value = Math.round(eased * 100) / 100;

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

      return () => {
        trigger.kill();
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
  const lightChunkSets = darkBand
    ? geometry.chunkSets.map((chunks) =>
        chunks.filter(
          (chunk) =>
            chunk.maxY >= darkBand.y &&
            chunk.minY <= darkBand.y + darkBand.height,
        ),
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
        {darkBand || geometry.curtainBand ? (
          <defs>
            {darkBand ? (
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
            ) : null}
            {geometry.curtainBand ? (
              <clipPath
                id={`${svgId}-curtain-surfaces`}
                clipPathUnits="userSpaceOnUse"
              >
                <rect
                  height={Math.max(geometry.curtainBand.top, 0)}
                  width={geometry.width}
                  x="0"
                  y="0"
                />
                <rect
                  height={Math.max(
                    geometry.height - geometry.curtainBand.bottom,
                    0,
                  )}
                  width={geometry.width}
                  x="0"
                  y={geometry.curtainBand.bottom}
                />
              </clipPath>
            ) : null}
          </defs>
        ) : null}

        <g
          clipPath={
            geometry.curtainBand
              ? `url(#${svgId}-curtain-surfaces)`
              : undefined
          }
        >
          {geometry.chunkSets.map((chunks, setIndex) => (
            <g key={setIndex}>
              {chunks.map((chunk) => (
                <g
                  data-stroke-chunk="true"
                  data-stroke-max-y={chunk.maxY}
                  data-stroke-min-y={chunk.minY}
                  data-stroke-threshold={chunk.threshold}
                  key={chunk.startY}
                  style={{ opacity: 0 }}
                >
                  <BrushChunk
                    chunk={chunk}
                    palette={MAIN_PALETTE}
                    setIndex={setIndex}
                    strokeWidth={geometry.strokeWidth}
                  />
                </g>
              ))}
            </g>
          ))}

          {darkBand ? (
            <g clipPath={`url(#${svgId}-dark-band)`}>
              {lightChunkSets.map((chunks, setIndex) => (
                <g key={setIndex}>
                  {chunks.map((chunk) => (
                    <g
                      data-stroke-chunk="true"
                      data-stroke-max-y={chunk.maxY}
                      data-stroke-min-y={chunk.minY}
                      data-stroke-threshold={chunk.threshold}
                      key={chunk.startY}
                      style={{ opacity: 0 }}
                    >
                      <BrushChunk
                        chunk={chunk}
                        palette={LIGHT_PALETTE}
                        setIndex={setIndex}
                        strokeWidth={geometry.strokeWidth}
                      />
                    </g>
                  ))}
                </g>
              ))}
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
