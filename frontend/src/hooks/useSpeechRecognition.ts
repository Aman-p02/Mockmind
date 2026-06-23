"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeechRecognition() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          // Note: In continuous mode with interimResults, this replaces the whole text block. 
          // If the user manually edited `text` while recording, it might be overwritten.
          // In a real app, you'd manage cursor positions, but this is fine for an MVP.
          setText(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback(() => {
    setText("");
    setIsListening(true);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    hasSupport: !!recognitionRef.current
  };
}
