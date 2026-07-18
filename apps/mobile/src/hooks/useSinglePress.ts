import { useRef, useCallback } from 'react';

/**
 * A custom hook to prevent double taps/clicks on buttons and navigation links.
 * It wraps any press handler with a cooldown period to ensure it only executes once.
 */
export function useSinglePress() {
  const isPressing = useRef(false);

  const wrapPress = useCallback((callback: () => void, cooldown = 800) => {
    return () => {
      if (isPressing.current) return;
      isPressing.current = true;
      callback();
      setTimeout(() => {
        isPressing.current = false;
      }, cooldown);
    };
  }, []);

  return wrapPress;
}
