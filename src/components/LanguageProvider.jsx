"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DEFAULT_HOMEPAGE_LANGUAGE } from "../lib/homepage-copy";

const LanguageContext = createContext(null);
const BOTTOM_ANCHOR_THRESHOLD = 180;

export const LANGUAGE_LAYOUT_SETTLED_EVENT =
  "glamour:language-layout-settled";

function isNearDocumentBottom() {
  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body?.scrollHeight ?? 0,
  );

  return (
    documentHeight - (window.scrollY + window.innerHeight) <=
    BOTTOM_ANCHOR_THRESHOLD
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_HOMEPAGE_LANGUAGE);
  const languageRef = useRef(DEFAULT_HOMEPAGE_LANGUAGE);
  const pendingBottomAnchorRef = useRef(false);

  const setLanguage = useCallback((nextLanguage) => {
    const currentLanguage = languageRef.current;
    const resolvedLanguage =
      typeof nextLanguage === "function"
        ? nextLanguage(currentLanguage)
        : nextLanguage;

    if (resolvedLanguage === currentLanguage) {
      return;
    }

    pendingBottomAnchorRef.current =
      pendingBottomAnchorRef.current || isNearDocumentBottom();
    languageRef.current = resolvedLanguage;
    setLanguageState(resolvedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;

    let settledFrame = 0;
    const layoutFrame = requestAnimationFrame(() => {
      settledFrame = requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent(LANGUAGE_LAYOUT_SETTLED_EVENT, {
            detail: {
              anchorToBottom: pendingBottomAnchorRef.current,
            },
          }),
        );
        pendingBottomAnchorRef.current = false;
      });
    });

    return () => {
      cancelAnimationFrame(layoutFrame);

      if (settledFrame) {
        cancelAnimationFrame(settledFrame);
      }
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
