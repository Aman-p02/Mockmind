"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle2, AlertTriangle, Home, RefreshCcw, Loader2, Star } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/interview/result/${resolvedParams.id}`)
      .then((res) => {
        setResult(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch result", error);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-400 font-medium animate-pulse">AI is analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 pt-28 md:pt-32 pb-8 md:pb-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {/* Overall Score */}
          <div className="md:col-span-1 bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
            <h2 className="text-xl font-bold mb-6 relative z-10">Overall Score</h2>
            <div className="relative w-40 h-40 flex items-center justify-center mb-4 z-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                <circle
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                  className={`${result.score >= 8 ? 'text-green-500' : result.score >= 6 ? 'text-yellow-500' : 'text-red-500'}`}
                  strokeDasharray={`${(result.score / 10) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold">{result.score}</span>
                <span className="text-sm text-gray-400">/ 10</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-400 z-10">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(result.score / 2) ? 'fill-current' : 'text-gray-600'}`} />
              ))}
            </div>
          </div>

          {/* Feedback Summary */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Strengths
              </h3>
              <ul className="space-y-3">
                {result.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {result.improvements.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-6 md:p-8 mb-12"
        >
          <h3 className="text-xl font-bold mb-3 text-primary">AI Overall Suggestion</h3>
          <p className="text-lg text-gray-200 leading-relaxed">{result.suggestion}</p>
        </motion.div>

        {/* Detailed Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Question-wise Review</h2>
          <div className="space-y-6">
            {result.reviews.map((review: any, i: number) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg max-w-3xl">
                    <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                    {review.question}
                  </h3>
                  <div className={`px-3 py-1 rounded-lg font-bold text-sm border ${
                    review.score >= 8 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    review.score >= 6 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    Score: {review.score}/10
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Answer</span>
                  <p className="mt-1 text-gray-300 bg-background/50 p-4 rounded-xl italic">"{review.answer}"</p>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Feedback</span>
                  <p className="mt-1 text-gray-300 bg-primary/5 border border-primary/10 p-4 rounded-xl">{review.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/interview/setup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Start New Interview
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-card border border-border px-8 py-4 font-bold text-foreground hover:bg-white/5 transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
