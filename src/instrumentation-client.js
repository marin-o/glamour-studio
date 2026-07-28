(() => {
  if (
    typeof window === "undefined" ||
    window.__glamourHistoryTransitionBridge
  ) {
    return;
  }

  const bridge = {
    bypass: false,
    pending: null,
    failOpenTimer: null,
    release() {
      const pending = bridge.pending;
      if (!pending) return;

      bridge.pending = null;
      window.clearTimeout(bridge.failOpenTimer);
      bridge.failOpenTimer = null;
      bridge.bypass = true;
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: pending.state }),
      );
    },
  };

  window.__glamourHistoryTransitionBridge = bridge;

  window.addEventListener(
    "popstate",
    (event) => {
      if (bridge.bypass) {
        bridge.bypass = false;
        return;
      }

      event.stopImmediatePropagation();
      bridge.pending = {
        pathname: window.location.pathname,
        state: event.state,
      };

      let accepted = false;
      window.dispatchEvent(
        new CustomEvent("glamour:history-transition", {
          detail: {
            pathname: bridge.pending.pathname,
            accept() {
              accepted = true;
            },
          },
        }),
      );

      if (!accepted) {
        bridge.release();
        return;
      }

      bridge.failOpenTimer = window.setTimeout(() => {
        bridge.release();
      }, 2400);
    },
    true,
  );
})();
