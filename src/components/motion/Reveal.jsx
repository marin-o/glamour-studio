"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

import { useMakeupStrokeReveal } from "./MakeupStroke";

const motionTags = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  li: motion.li,
  p: motion.p,
  span: motion.span,
};

// Transform and opacity only — animating clip-path here forced per-frame
// paint work on every revealing element and broke the documented
// progressive-enhancement invariant.
const revealVariants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function Reveal({
  anchor = true,
  as = "div",
  children,
  className = "",
  revealId,
  side = "center",
  y = 0.5,
  ...props
}) {
  const isVisible = useMakeupStrokeReveal(revealId);
  const MotionTag = motionTags[as] || motion.div;
  const combinedClassName = useMemo(
    () => `${className} relative z-10`.trim(),
    [className],
  );

  return (
    <MotionTag
      animate={isVisible ? "visible" : "hidden"}
      className={combinedClassName}
      data-reveal-id={revealId}
      data-stroke-anchor={anchor ? "true" : undefined}
      data-stroke-side={anchor ? side : undefined}
      data-stroke-y={anchor ? y : undefined}
      initial={false}
      transition={{
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      variants={revealVariants}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
