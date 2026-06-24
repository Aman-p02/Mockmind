"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, MicOff, Send, Clock, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "text";

  const { text, setText, isListening, startListening, stopListening, hasSupport } = useSpeechRecognition();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(5);

  useEffect(() => {
    // In text mode, we use `answer` state.
    // In voice mode, we sync `answer` with `text` from speech recognition hook.
    if (mode === "voice") {
      setAnswer(text);
    }
  }, [text, mode]);

  useEffect(() => {
    // Fetch interview transcript
    api.get(`/api/interview/${resolvedParams.id}`)
      .then((res) => {
        const transcript = res.data.transcript || [];
        const mappedQuestions = transcript.map((t: any, index: number) => ({
          id: index,
          text: t.question,
          answer: t.answer
        }));
        setQuestions(mappedQuestions);
        setTotalQuestions(res.data.type === 'on-campus' ? 11 : 5);
        
        const nextUnanswered = mappedQuestions.findIndex((q: any) => !q.answer);
        if (nextUnanswered !== -1) {
          setCurrentIndex(nextUnanswered);
        } else {
          setCurrentIndex(mappedQuestions.length - 1 >= 0 ? mappedQuestions.length - 1 : 0);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch questions", error);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  useEffect(() => {
    // Timer
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.post("/api/interview/submit", {
        interviewId: resolvedParams.id,
        answer: answer,
      });

      const { nextQuestion, isFinished } = res.data;

      setQuestions((prev) => {
        const updated = [...prev];
        if (updated[currentIndex]) {
           updated[currentIndex].answer = answer;
        }
        if (nextQuestion) {
           updated.push({ id: updated.length, text: nextQuestion, answer: null });
        }
        return updated;
      });

      setSubmitting(false);
      setAnswer("");
      if (mode === "voice") setText("");

      if (isFinished) {
        router.push(`/interview/result/${resolvedParams.id}`);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }

    } catch (error) {
      console.error("Failed to submit answer", error);
      alert("Failed to submit answer. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="pt-28 md:pt-32 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-24 md:top-28 z-40">
          <div className="container mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-400">
                Question <span className="text-foreground">{currentIndex + 1}</span> of {totalQuestions}
              </div>
              <div className="w-32 h-2 bg-background rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono bg-background px-3 py-1.5 rounded-lg border border-border">
              <Clock className="w-4 h-4 text-primary" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 flex flex-col max-w-4xl">
        {/* Question Area */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Answer Area */}
        <div className="flex-1 flex flex-col">
          {mode === "voice" && !hasSupport && (
            <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3 text-orange-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Your browser does not support the Web Speech API. Please switch to Text Mode or use Chrome/Edge.</p>
            </div>
          )}

          <div className="relative flex-1 min-h-[200px]">
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (mode === "voice") setText(e.target.value);
              }}
              placeholder={mode === "voice" ? "Your spoken answer will appear here..." : "Type your answer here..."}
              className="w-full h-full min-h-[200px] p-6 rounded-2xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all text-lg leading-relaxed shadow-inner"
            />
            
            {mode === "voice" && hasSupport && (
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-md ${
                    isListening 
                      ? "bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? "Stop Recording" : "Start Recording"}
                </button>
                {isListening && <span className="text-sm text-red-400 font-medium animate-pulse flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Listening...</span>}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
              {currentIndex === totalQuestions - 1 ? "Finish Interview" : "Submit Answer"}
            </button>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
