"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  
  useEffect(() => {
    if (isInView) {
      animate(
        "span.type-char",
        {
          opacity: 1,
        },
        {
          duration: 0.1,
          delay: stagger(0.1),
        }
      );
    }
  }, [isInView, animate]);

  return (
    <div className={cn("flex items-baseline my-2", className)}>
      <motion.div ref={scope} className="flex">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block mr-3 lg:mr-4">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{ opacity: 0 }}
                  key={`char-${index}`}
                  className={cn("type-char opacity-0 inline-block", word.className)}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          );
        })}
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] md:w-[6px] h-[1em] bg-purple-500 ml-2 -mb-[0.1em]",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  return (
    <div className={cn("flex items-baseline my-2", className)}>
      <motion.div
        className="overflow-hidden"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="whitespace-nowrap flex items-baseline">
          {words.map((word, idx) => {
            return (
              <span key={`word-${idx}`} className={cn("mr-3 lg:mr-4", word.className)}>
                {word.text}
              </span>
            );
          })}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] md:w-[6px] h-[1em] bg-purple-500 ml-2 -mb-[0.1em]",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
