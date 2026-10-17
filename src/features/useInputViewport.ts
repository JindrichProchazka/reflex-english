import { useEffect } from 'react';
import { keepFocusedInputVisible } from '../application/viewport';
export function useInputViewport() {
  useEffect(() => {
    let frame = 0;
    const reposition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(keepFocusedInputVisible);
    };
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', reposition);
    document.addEventListener('focusin', reposition);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', reposition);
      document.removeEventListener('focusin', reposition);
    };
  }, []);
}
