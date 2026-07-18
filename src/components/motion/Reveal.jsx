"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { useMakeupStrokeReveal } from "./MakeupStroke";

const motionTags = {
  article: motion.article,
  div: motion.div,
  h2: motion.h2,
  li: motion.li,
  p: motion.p,
  span: motion.span,
};

function hiddenState(role, side) {
  const direction = side === "end" || side === "outer-end" ? 1 : -1;

  if (role === "editorial") {
    return { opacity: 0, x: direction * 36 };
  }

  return { opacity: 0, x: direction * 14, y: 8 };
}

export default function Reveal({
  anchor = true,
  as = "div",
  children,
  className = "",
  revealId,
  role = "editorial",
  side = "start",
  strokeSide = side,
  y = 0.5,
  ...props
}) {
  const isVisible = useMakeupStrokeReveal(revealId);
  const prefersReducedMotion = useReducedMotion();
  const [hasRevealed, setHasRevealed] = useState(false);
  const MotionTag = motionTags[as] || motion.div;
  const combinedClassName = useMemo(
    () => `${className} relative z-10`.trim(),
    [className],
  );
  const variants = useMemo(
    () => ({
      hidden: hiddenState(role, side),
      visible: { opacity: 1, x: 0, y: 0 },
    }),
    [role, side],
  );

  const isInitialConcealment = !isVisible && !hasRevealed;

  return (
    <MotionTag
      animate={prefersReducedMotion || isVisible ? "visible" : "hidden"}
      className={combinedClassName}
      data-motion-role={role}
      data-reveal-id={revealId}
      data-stroke-anchor={anchor ? "true" : undefined}
      data-stroke-side={anchor ? strokeSide : undefined}
      data-stroke-y={anchor ? y : undefined}
      initial={false}
      onAnimationStart={() => {
        if (isVisible && !prefersReducedMotion) {
          setHasRevealed(true);
        }
      }}
      transition={{
        // Content is server-rendered visible for the no-JS fallback. When the
        // stroke controller hydrates, conceal unrevealed content immediately
        // instead of visibly playing the entrance backward.
        duration: isInitialConcealment
          ? 0
          : role === "editorial"
            ? 0.78
            : 0.58,
        ease: [0.22, 1, 0.36, 1],
      }}
      variants={variants}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
