const isDebugEnabled = () => {
  if (import.meta.env?.VITE_LOGBOOK_DEBUG === "true") return true;
  if (typeof window !== "undefined") {
    try {
      return window.localStorage?.getItem("logbookDebug") === "true";
    } catch {
      // Access to localStorage can fail in privacy modes; treat as disabled.
      return false;
    }
  }
  return false;
};

export function debugLog(...args) {
  if (isDebugEnabled()) {
    console.log(...args);
  }
}

// Enable verbose logging in the browser console with one of the following:
//   1. Use an environment flag when running Vite: VITE_LOGBOOK_DEBUG=true npm run dev
//   2. Persist a toggle in devtools: localStorage.setItem('logbookDebug', 'true')
// Remove the flag or call localStorage.removeItem('logbookDebug') to silence logs.
