import React, { useRef } from "react";
import { useMousePosition } from "~~/hooks/useMousePosition";

interface MouseTrackerProps {
  children: React.ReactNode;
  className?: string;
}

export const MouseTracker: React.FC<MouseTrackerProps> = ({ children, className = "mouse-position-tracker" }) => {
  const ref = useRef<HTMLDivElement>(null);
  useMousePosition(ref);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// Higher-order component wrapper
export function withMouseTracking<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithMouseTracking(props: P) {
    return (
      <MouseTracker>
        <WrappedComponent {...props} />
      </MouseTracker>
    );
  };
}
