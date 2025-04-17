import { RefObject, useCallback, useEffect } from "react";

export const useMousePosition = (ref: RefObject<HTMLElement>) => {
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Update CSS variables for the hover effect
      element.style.setProperty("--mouse-x", `${x}px`);
      element.style.setProperty("--mouse-y", `${y}px`);
    },
    [ref],
  );

  const handleMouseLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    // Reset the position when mouse leaves
    element.style.setProperty("--mouse-x", "center");
    element.style.setProperty("--mouse-y", "center");
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, ref]);
};
