"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PageTransitionContext = createContext({
  navigate: () => {},
});

const transition = {
  duration: 0.72,
  ease: [0.76, 0, 0.24, 1],
};

const directionForPath = (pathname) =>
  pathname === "/lookbook" ? "forward" : "backward";

export function PageTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const curtainControls = useAnimationControls();
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [revealVersion, setRevealVersion] = useState(0);
  const [idleVersion, setIdleVersion] = useState(0);
  const pendingPathRef = useRef(null);
  const directionRef = useRef("forward");
  const displayedPathRef = useRef(pathname);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (pathname === displayedPathRef.current) {
      return;
    }

    if (prefersReducedMotion) {
      displayedPathRef.current = pathname;
      pendingPathRef.current = null;
      isTransitioningRef.current = false;
      curtainControls
        .start({
          x: directionForPath(pathname) === "forward" ? "-100%" : "100%",
          transition: { duration: 0 },
        })
        .then(() => {
          setDisplayedChildren(children);
        });
      return;
    }

    if (pendingPathRef.current === pathname) {
      curtainControls
        .start({ x: "0%", transition: { duration: 0 } })
        .then(() => {
          displayedPathRef.current = pathname;
          setDisplayedChildren(children);
          setRevealVersion((version) => version + 1);
        });
      return;
    }

    if (isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    directionRef.current = directionForPath(pathname);

    const entryPosition =
      directionRef.current === "forward" ? "100%" : "-100%";

    curtainControls.set({ x: entryPosition });
    curtainControls
      .start({ x: "0%", transition })
      .then(() => {
        directionRef.current = directionForPath(pathname);
        displayedPathRef.current = pathname;
        setDisplayedChildren(children);
        setRevealVersion((version) => version + 1);
      });
  }, [
    children,
    curtainControls,
    idleVersion,
    pathname,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    if (revealVersion === 0) {
      return;
    }

    const exitPosition =
      directionRef.current === "forward" ? "-100%" : "100%";

    curtainControls
      .start({ x: exitPosition, transition })
      .finally(() => {
        pendingPathRef.current = null;
        isTransitioningRef.current = false;
        setIdleVersion((version) => version + 1);
      });
  }, [curtainControls, revealVersion]);

  const handleHistoryTransition = useCallback(
    async (event) => {
      const bridge = window.__glamourHistoryTransitionBridge;
      const destinationPath = event.detail?.pathname;

      event.detail?.accept?.();

      if (!bridge?.pending || !destinationPath) {
        bridge?.release?.();
        return;
      }

      if (prefersReducedMotion || isTransitioningRef.current) {
        bridge.release();
        return;
      }

      isTransitioningRef.current = true;
      directionRef.current = directionForPath(destinationPath);
      pendingPathRef.current = destinationPath;

      const entryPosition =
        directionRef.current === "forward" ? "100%" : "-100%";

      curtainControls.set({ x: entryPosition });
      await curtainControls.start({ x: "0%", transition });
      bridge.release();
    },
    [curtainControls, prefersReducedMotion],
  );

  useEffect(() => {
    window.addEventListener(
      "glamour:history-transition",
      handleHistoryTransition,
    );

    return () => {
      window.removeEventListener(
        "glamour:history-transition",
        handleHistoryTransition,
      );
    };
  }, [handleHistoryTransition]);

  const navigate = useCallback(
    async (href, direction = "forward") => {
      if (href === pathname || isTransitioningRef.current) {
        return;
      }

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      isTransitioningRef.current = true;
      directionRef.current = direction;
      pendingPathRef.current = href;

      const entryPosition = direction === "forward" ? "100%" : "-100%";
      curtainControls.set({ x: entryPosition });
      await curtainControls.start({ x: "0%", transition });
      router.push(href);
    },
    [
      curtainControls,
      pathname,
      prefersReducedMotion,
      router,
    ],
  );

  return (
    <PageTransitionContext.Provider value={{ navigate }}>
      {prefersReducedMotion ? children : displayedChildren}
      <motion.div
        aria-hidden="true"
        className="pointer-events-auto fixed inset-0 z-[100] bg-blush"
        initial={false}
        animate={curtainControls}
        style={{ x: "100%" }}
      />
    </PageTransitionContext.Provider>
  );
}

export function TransitionLink({
  children,
  direction = "forward",
  href,
  onClick,
  target,
  ...props
}) {
  const { navigate } = useContext(PageTransitionContext);

  const handleClick = (event) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      target === "_blank" ||
      typeof href !== "string" ||
      href.startsWith("#")
    ) {
      return;
    }

    event.preventDefault();
    navigate(href, direction);
  };

  return (
    <Link
      {...props}
      href={href}
      target={target}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
