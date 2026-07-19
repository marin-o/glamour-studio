"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const CHARACTER_DELAY = 0.073;

export default function TypewriterTitle({ className, id, words }) {
  const styledWords = [
    { className: "text-accent-deep", text: words[0] },
    {
      className: "block text-right text-ink md:pl-[0.55em] md:text-left",
      text: words[1],
    },
  ];
  const enhanced = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const prefersReducedMotion = useReducedMotion();

  const shouldType = enhanced && !prefersReducedMotion;

  return (
    <h1
      className={`${className} relative z-10`}
      data-motion-role="typewriter"
      data-reveal-id="hero-title"
      data-stroke-anchor="true"
      data-stroke-side="end"
      data-stroke-y="0.58"
      id={id}
    >
      <span className={shouldType ? "opacity-0" : undefined}>
        {styledWords[0].text}{" "}
        <span className={styledWords[1].className}>
          {styledWords[1].text}
        </span>
      </span>
      {shouldType ? (
        <span aria-hidden="true" className="absolute inset-0">
          {styledWords.map((word, wordIndex) => (
            <span className={word.className} key={word.text}>
              {Array.from(word.text).map((character, characterIndex) => (
                <motion.span
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  key={`${character}-${characterIndex}`}
                  transition={{
                    delay:
                      styledWords
                        .slice(0, wordIndex)
                        .reduce(
                          (delay, previousWord) =>
                            delay + previousWord.text.length * CHARACTER_DELAY,
                          0,
                        ) +
                      characterIndex * CHARACTER_DELAY,
                    duration: 0.01,
                  }}
                >
                  {character}
                </motion.span>
              ))}
            </span>
          ))}
        </span>
      ) : null}
    </h1>
  );
}
