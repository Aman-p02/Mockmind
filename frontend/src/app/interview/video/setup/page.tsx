"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Check, ChevronRight, Video, Loader2, FileText, Building2, Briefcase } from "lucide-react";

function VideoSetupForm() {
    const router = useRouter();
    const [type, setType] = useState<"on-campus" | "off-campus">("on-campus");
    const [difficulty, setDifficulty] = useState("medium");
    const [resumeSummary, setResumeSummary] = useState("");

    const difficulties = [
        { id: "easy", name: "Easy", desc: "Basic concepts and definitions", color: "green" },
        { id: "medium", name: "Medium", desc: "Practical scenarios and problem-solving", color: "yellow" },
        { id: "hard", name: "Hard", desc: "Advanced architectures and optimizations", color: "red" },
    ];

    const handleStart = () => {
        if (type === "off-campus" && !resumeSummary.trim()) {
            alert("Please provide a brief resume summary for Off-Campus mode.");
            return;
        }
        const params = new URLSearchParams({
            mode: type,
            difficulty,
            resume: resumeSummary.trim(),
        });
        router.push(`/interview/video?${params.toString()}`);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 w-full">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-rose-500/20 p-2 rounded-lg text-rose-400">
                        <Video className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Video Interview</h1>
                </div>
                <p className="text-gray-400">
                    Face a real-time video interview with Aryan Mehta — Senior Software Engineer, 8 years experience.
                </p>
            </div>

            {/* Interviewer Info Banner */}
            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-2xl p-5 mb-10 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-rose-400">
                    AM
                </div>
                <div>
                    <p className="font-bold text-lg">Aryan Mehta</p>
                    <p className="text-sm text-gray-400">Senior Software Engineer · 8 Years Experience</p>
                    <p className="text-xs text-rose-400 mt-1">Will ask 5–7 questions · AI-powered · Live voice interaction</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Interview Type */}
                <section>
                    <h2 className="text-xl font-bold mb-4">1. Select Interview Type</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { id: "on-campus", label: "On-Campus Placement", desc: "Structured, standardized company format.", icon: <Building2 className="w-5 h-5" />, color: "blue" },
                            { id: "off-campus", label: "Off-Campus Placement", desc: "Tailored to your Resume & Target Role.", icon: <Briefcase className="w-5 h-5" />, color: "purple" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setType(t.id as "on-campus" | "off-campus")}
                                className={`text-left p-5 rounded-xl border transition-all relative ${type === t.id
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card border-border hover:border-gray-500"
                                    }`}
                            >
                                {type === t.id && (
                                    <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                <div className={`mb-3 w-10 h-10 rounded-lg flex items-center justify-center ${type === t.id ? "bg-primary/20 text-primary" : "bg-card/80 text-gray-400"}`}>
                                    {t.icon}
                                </div>
                                <h3 className={`font-bold mb-1 ${type === t.id ? "text-primary" : ""}`}>{t.label}</h3>
                                <p className="text-sm text-gray-400">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Difficulty */}
                <section>
                    <h2 className="text-xl font-bold mb-4">2. Select Difficulty</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {difficulties.map((d) => (
                            <button
                                key={d.id}
                                onClick={() => setDifficulty(d.id)}
                                className={`text-left p-5 rounded-xl border transition-all relative ${difficulty === d.id
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card border-border hover:border-gray-500"
                                    }`}
                            >
                                {difficulty === d.id && (
                                    <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                <h3 className={`font-bold mb-1 ${difficulty === d.id ? "text-primary" : ""}`}>{d.name}</h3>
                                <p className="text-sm text-gray-400">{d.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Resume Summary (Off-Campus Only) */}
                {type === "off-campus" && (
                    <section>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            3. Resume Summary <span className="text-sm font-normal text-gray-400">(Off-Campus)</span>
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Paste a brief summary of your resume (skills, projects, experience — 100–200 words). The AI interviewer will tailor questions based on this.
                        </p>
                        <textarea
                            value={resumeSummary}
                            onChange={(e) => setResumeSummary(e.target.value)}
                            placeholder="e.g. I am a Full Stack developer with 2 years experience in React, Node.js, and PostgreSQL. I have worked on e-commerce platforms, built REST APIs, and have experience with Docker and AWS deployments..."
                            className="w-full h-40 bg-card border border-border rounded-xl p-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">{resumeSummary.split(" ").filter(Boolean).length} / 200 words</p>
                    </section>
                )}

                {/* Requirements Note */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300 flex gap-3">
                    <span className="text-lg">📷</span>
                    <div>
                        <span className="font-semibold">Camera & Microphone Required.</span>
                        {" "}Your browser will ask for permission when you enter the interview room. Please allow both to proceed.
                    </div>
                </div>

                {/* Start Button */}
                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={handleStart}
                        className="flex items-center gap-2 rounded-xl bg-rose-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-rose-500 hover:shadow-rose-500/25 transition-all text-lg"
                    >
                        <Video className="w-5 h-5" />
                        Enter Interview Room
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function VideoSetupPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex pt-28 md:pt-32">
                <Suspense fallback={<div className="p-8 text-center w-full mt-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
                    <VideoSetupForm />
                </Suspense>
            </main>
        </div>
    );
}
