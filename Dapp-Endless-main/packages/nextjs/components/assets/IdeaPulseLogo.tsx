import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export const IdeaPulseLogo = ({ className = "" }: { className?: string; withAnimation?: boolean }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  return (
    <Image
      src={`/${isDarkMode ? "logo-dark" : "logo-light"}.svg`}
      alt="IdeaPulse Logo"
      className={`w-auto h-10 ${className}`}
      width={40}
      height={40}
    />
  );
};
