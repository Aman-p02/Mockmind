"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        "h-full w-full relative flex items-center justify-center overflow-hidden bg-black",
        className
      )}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mounted && [...Array(10)].map((_, i) => (
          <Beam key={i} delay={i * 0.5} left={`${5 + i * 10}%`} />
        ))}
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

const Beam = ({ delay, left }: { delay: number; left: string }) => {
  const [explode, setExplode] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setExplode(true);
        setTimeout(() => setExplode(false), 800);
      }, 3000);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left }}>
      <motion.div
        initial={{ top: "-20%", opacity: 0 }}
        animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
        }}
        className="absolute w-[2px] h-[200px] bg-gradient-to-b from-transparent via-purple-500 to-white"
      />
      {explode && (
        <motion.div
          initial={{ opacity: 1, scale: 0, bottom: 0 }}
          animate={{ opacity: 0, scale: 3, bottom: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md mix-blend-screen"
        />
      )}
    </div>
  );
};
