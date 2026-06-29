"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
    CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw, Loader2, TrendingUp
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuestionFeedback {
    question: string;
    user_answer: string;
    feedback: string;
    score: number;
}

interface ReportData {
    overall_score: number;
    communication_score: number;
    technical_score: number;
    confidence_score: number;
    posture_score: number;
    strengths: string[];
    areas_to_improve: string[];
    question_wise_feedback: QuestionFeedback[];
    final_remarks: string;
}

interface SessionData {
    mode: string;
    difficulty: string;
    resumeSummary: string;
    qaHistory: { question: string; answer: string; timestamp: number }[];
    postureHistory: { timestamp: number; score: number }[];
    fillerWords: Record<string, number>;
    pauseDurations: number[];
}

// ─── Circular Score Ring ──────────────────────────────────────────────────────
function ScoreRing({
    score,
    label,
    size = 120,
    strokeWidth = 10,
    color = "#f43f5e",
}: {
    score: number;
    label: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
}) {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setDisplayed(score), 100);
        return () => clearTimeout(timeout);
    }, [score]);

    const offset = circumference - (displayed / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none"
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center rotate-0">
                    <span className="text-2xl font-bold">{Math.round(displayed)}</span>
                </div>
            </div>
            <p className="text-xs text-gray-400 font-medium text-center leading-tight">{label}</p>
        </div>
    );
}

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({ qf, index }: { qf: QuestionFeedback; index: number }) {
    const [open, setOpen] = useState(index === 0);
    const scoreColor =
        qf.score >= 80 ? "text-green-400" : qf.score >= 60 ? "text-yellow-400" : "text-red-400";
    const scoreBg =
        qf.score >= 80 ? "bg-green-500/20" : qf.score >= 60 ? "bg-yellow-500/20" : "bg-red-500/20";

    return (
        <div className="border border-border/60 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-card/60 hover:bg-card/80 transition text-left gap-4"
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-xs text-gray-500 flex-shrink-0">Q{index + 1}</span>
                    <p className="text-sm font-medium truncate">{qf.question}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${scoreBg} ${scoreColor}`}>
                        {qf.score}/100
                    </span>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
            </button>
            {open && (
                <div className="px-5 py-4 bg-background/40 space-y-3 border-t border-border/40">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Answer</p>
                        <p className="text-sm text-gray-300 leading-relaxed bg-card/40 rounded-lg px-3 py-2">
                            {qf.user_answer || <span className="italic text-gray-500">No answer detected.</span>}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Feedback</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{qf.feedback}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Report Page ──────────────────────────────────────────────────────────────
export default function VideoReportPage() {
    const router = useRouter();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const sessionRef = useRef<SessionData | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("videoInterviewSession");
        if (!raw) {
            setError("No interview session found. Please complete a video interview first.");
            setLoading(false);
            return;
        }

        const session: SessionData = JSON.parse(raw);
        sessionRef.current = session;
        generateReport(session);
    }, []);

    const generateReport = async (session: SessionData) => {
        const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!apiKey || apiKey === "your_groq_api_key_here") {
            // Use mock report when API key not configured
            setReport(buildMockReport(session));
            setLoading(false);
            return;
        }

        const avgPosture =
            session.postureHistory.length > 0
                ? Math.round(
                    session.postureHistory.reduce((a, b) => a + b.score, 0) / session.postureHistory.length
                )
                : 70;

        const totalFillers = Object.values(session.fillerWords).reduce((a, b) => a + b, 0);

        const prompt = `You are evaluating a mock job interview. Below is the full interview data. Generate a comprehensive evaluation as a JSON object.

Interview Mode: ${session.mode}
Difficulty: ${session.difficulty}
Questions & Answers:
${session.qaHistory.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "No answer provided"}`).join("\n\n")}

Behavioral Metrics:
- Average Posture Score: ${avgPosture}/100
- Total Filler Words Used: ${totalFillers} (${JSON.stringify(session.fillerWords)})

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no extra text):
{
  "overall_score": <number 0-100>,
  "communication_score": <number 0-100>,
  "technical_score": <number 0-100>,
  "confidence_score": <number 0-100>,
  "posture_score": ${avgPosture},
  "strengths": [<string>, <string>, <string>],
  "areas_to_improve": [<string>, <string>, <string>],
  "question_wise_feedback": [
    { "question": "<q>", "user_answer": "<a>", "feedback": "<feedback>", "score": <number 0-100> }
  ],
  "final_remarks": "<2-3 sentence encouraging closing remark>"
}`;

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 2048,
                }),
            });

            if (!res.ok) throw new Error("Groq API error");
            const data = await res.json();
            const content: string = data.choices[0].message.content;

            // Extract JSON even if wrapped in markdown
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid JSON response from AI");
            const parsed: ReportData = JSON.parse(jsonMatch[0]);
            setReport(parsed);
        } catch (err: any) {
            console.error("Report generation error:", err);
            setReport(buildMockReport(session));
        } finally {
            setLoading(false);
        }
    };

    const buildMockReport = (session: SessionData): ReportData => ({
        overall_score: 72,
        communication_score: 75,
        technical_score: 68,
        confidence_score: 74,
        posture_score: session.postureHistory.length > 0
            ? Math.round(session.postureHistory.reduce((a, b) => a + b.score, 0) / session.postureHistory.length)
            : 70,
        strengths: [
            "Clear and structured responses",
            "Good problem-solving communication",
            "Demonstrated relevant experience",
        ],
        areas_to_improve: [
            "Reduce use of filler words (um, uh)",
            "Provide more specific examples",
            "Work on conciseness in technical explanations",
        ],
        question_wise_feedback: session.qaHistory.map((q, i) => ({
            question: q.question,
            user_answer: q.answer,
            feedback: `Your response showed understanding of the topic. Consider adding more concrete examples to strengthen this answer.`,
            score: 70 + Math.floor(Math.random() * 20),
        })),
        final_remarks:
            "You demonstrated solid foundational knowledge and a positive attitude throughout the interview. With focused practice on communication clarity and technical depth, you'll be well-prepared for real interviews. Keep it up!",
    });

    const scoreColors: Record<string, string> = {
        communication: "#a855f7",
        technical: "#3b82f6",
        confidence: "#f59e0b",
        posture: "#10b981",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <Loader2 className="w-14 h-14 animate-spin mx-auto text-rose-400" />
                    </div>
                    <p className="text-lg font-semibold">Generating your report…</p>
                    <p className="text-sm text-gray-400">Aryan Mehta is evaluating your performance</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={() => router.push("/interview/video/setup")}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Start a New Interview
                    </button>
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto max-w-4xl px-4 pt-28 pb-16">

                {/* ── Hero Score ── */}
                <div className="text-center mb-12">
                    <p className="text-sm text-rose-400 uppercase tracking-widest font-semibold mb-3">Interview Complete</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Performance Report</h1>
                    <p className="text-gray-400 text-sm mb-8">Evaluated by Aryan Mehta · AI-Powered Analysis</p>

                    <div className="inline-block">
                        <ScoreRing score={report.overall_score} label="Overall Score" size={160} strokeWidth={12} color="#f43f5e" />
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-4">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                            {report.overall_score >= 80 ? "Excellent performance!" : report.overall_score >= 60 ? "Good effort, keep practicing." : "Needs improvement — don't give up!"}
                        </span>
                    </div>
                </div>

                {/* ── Score Breakdown Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 bg-card/40 border border-border/50 rounded-2xl p-6">
                    <ScoreRing score={report.communication_score} label="Communication" color={scoreColors.communication} />
                    <ScoreRing score={report.technical_score} label="Technical" color={scoreColors.technical} />
                    <ScoreRing score={report.confidence_score} label="Confidence" color={scoreColors.confidence} />
                    <ScoreRing score={report.posture_score} label="Posture" color={scoreColors.posture} />
                </div>

                {/* ── Strengths & Improvements ── */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Strengths */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4 text-green-400 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Strengths
                        </h2>
                        <ul className="space-y-3">
                            {report.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Areas to Improve */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4 text-amber-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Areas to Improve
                        </h2>
                        <ul className="space-y-3">
                            {report.areas_to_improve.map((a, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Question-wise Feedback ── */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-5">Question-wise Feedback</h2>
                    <div className="space-y-3">
                        {report.question_wise_feedback.map((qf, i) => (
                            <AccordionItem key={i} qf={qf} index={i} />
                        ))}
                    </div>
                </div>

                {/* ── Final Remarks ── */}
                <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-2xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-sm font-bold text-rose-400">
                            AM
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Aryan Mehta</p>
                            <p className="text-xs text-gray-500">Senior Software Engineer</p>
                        </div>
                    </div>
                    <blockquote className="text-sm text-gray-300 leading-relaxed italic">
                        "{report.final_remarks}"
                    </blockquote>
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push("/interview/video/setup")}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
