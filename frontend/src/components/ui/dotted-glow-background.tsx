import React from "react";
import { cn } from "@/lib/utils";

interface DottedGlowBackgroundProps {
  className?: string;
  opacity?: number;
  gap?: number;
  radius?: number;
  colorLightVar?: string;
  glowColorLightVar?: string;
  colorDarkVar?: string;
  glowColorDarkVar?: string;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}

export function DottedGlowBackground({
  className,
  opacity = 1,
  gap = 16,
  radius = 2,
  glowColorDarkVar = "--primary",
  ...props
}: DottedGlowBackgroundProps) {
  return (
    <div
      className={cn("absolute inset-0 z-0 pointer-events-none", className)}
      style={{
        opacity,
        // Fallback to primary color if the var is not resolved
        backgroundImage: `radial-gradient(circle at center, var(${glowColorDarkVar}, #3b82f6) ${radius}px, transparent ${radius}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        maskImage: "radial-gradient(circle at center, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 100%)",
      }}
    />
  );
}
