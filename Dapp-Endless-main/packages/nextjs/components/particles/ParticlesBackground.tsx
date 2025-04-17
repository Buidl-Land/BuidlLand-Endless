"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const ParticlesBackground = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [isMobile, setIsMobile] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const primaryColor = isDarkMode ? "#8B5CF6" : "#4F46E5";
  const secondaryColor = isDarkMode ? "#3B82F6" : "#06B6D4";

  if (!init) return null;

  return (
    <Particles
      className="absolute inset-0"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          color: {
            value: [primaryColor, secondaryColor],
          },
          links: {
            color: isDarkMode ? "#8B5CF6" : "#4F46E5",
            distance: isMobile ? 100 : 150,
            enable: true,
            opacity: 0.3,
            width: 1.5,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: isMobile ? 0.8 : 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              width: 1000,
              height: 1000
            },
            value: isMobile ? 40 : 75,
          },
          opacity: {
            value: 0.2,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 2, max: 4 },
          },
        },
        detectRetina: true,
        responsive: [
          {
            maxWidth: 500,
            options: {
              particles: {
                number: {
                  value: 30,
                },
                move: {
                  speed: 0.6,
                },
              },
            },
          },
        ],
      }}
    />
  );
};
