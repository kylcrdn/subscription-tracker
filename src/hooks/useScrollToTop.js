/**
 * Hook that controls the "scroll to top" floating button visibility.
 * Shows the button once the user scrolls past `threshold` pixels (default 200).
 * Returns { showScrollTop, scrollToTop } for the consuming component.
 */
import { useState, useEffect } from "react";

export function useScrollToTop(threshold = 200) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { showScrollTop, scrollToTop };
}
