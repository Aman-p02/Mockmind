"use client";
import React from "react";
import { motion } from "framer-motion";

export const Spotlight = ({
  className = "",
}: {
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-[1000px] h-[500px] bg-white/5 blur-[100px] rounded-full mix-blend-screen" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] max-w-[500px] h-[300px] bg-primary/20 blur-[80px] rounded-full mix-blend-screen" />
    </motion.div>
  );
};
