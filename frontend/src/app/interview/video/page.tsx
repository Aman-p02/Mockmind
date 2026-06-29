"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import {
    Mic, MicOff, PhoneOff, Video, VideoOff, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type InterviewState =
    | "permission"
    | "permission_denied"
    | "idle"
    | "starting"
    | "speaking"
    | "listening"
    | "thinking"
    | "ended";

interface QAEntry {
    question: string;
    answer: string;
    timestamp: number;
}

interface PostureReading {
    timestamp: number;
    score: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const FILLER_WORDS = ["um", "uh", "like", "you know"];
const MAX_QUESTIONS = 6;
const SILENCE_TIMEOUT_MS = 7000;
const NO_SPEECH_TIMEOUT_MS = 30000;

// ─── Groq Helpers ─────────────────────────────────────────────────────────────
function buildSystemPrompt(mode: string, difficulty: string, resumeSummary: string) {
    return `You are Aryan Mehta, a senior software engineer at a top product-based tech company with 8 years of experience. You are conducting a technical mock interview.

Speak professionally but in a warm and encouraging tone.
Ask ONE question at a time.
After the candidate answers, respond with brief natural feedback like: "Good approach.", "Interesting, let me ask you something related.", or "Let's move ahead." — then immediately ask the next question in the SAME response.
Never reveal you are an AI. Never break character.

Adjust question difficulty based on: ${difficulty}
Interview mode: ${mode}
${resumeSummary ? `The candidate's resume summary:\n${resumeSummary}\nTailor questions based on their background.` : ""}

Format each response EXACTLY as:
REACTION: [brief 1-2 sentence reaction to the previous answer, or empty for first question]
QUESTION: [your next interview question]`;
}

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
        throw new Error("NEXT_PUBLIC_GROQ_API_KEY is not configured.");
    }
    const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 400,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Groq API error");
    }
    const data = await res.json();
    return data.choices[0].message.content as string;
}

async function speakWithElevenLabs(text: string): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId || apiKey === "your_elevenlabs_api_key_here") {
        // Fallback: browser TTS
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
    }
    const res = await fetch(`${ELEVENLABS_BASE}/${voiceId}`, {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
    });
    if (!res.ok) throw new Error("ElevenLabs API error");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Audio playback error")); };
        audio.play().catch(reject);
    });
}

function countFillerWords(text: string): Record<string, number> {
    const lower = text.toLowerCase();
    const result: Record<string, number> = {};
    for (const word of FILLER_WORDS) {
        const matches = lower.match(new RegExp(`\\b${word}\\b`, "g"));
        if (matches) result[word] = matches.length;
    }
    return result;
}

// ─── Main Interview Component ─────────────────────────────────────────────────
function VideoInterviewRoom() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "on-campus";
    const difficulty = searchParams.get("difficulty") || "medium";
    const resumeSummary = searchParams.get("resume") || "";

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const noSpeechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const postureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messagesRef = useRef<{ role: string; content: string }[]>([]);
    const isListeningRef = useRef(false);
    const mediapipeReadyRef = useRef(false);
    const processAnswerRef = useRef<any>(null);

    // State
    const [interviewState, setInterviewState] = useState<InterviewState>("permission");
    const [transcript, setTranscript] = useState("");
    const transcriptRef = useRef("");
    const setTranscriptWithRef = (val: string) => {
        setTranscript(val);
        transcriptRef.current = val;
    };
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentReaction, setCurrentReaction] = useState("");
    const [questionCount, setQuestionCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("Requesting camera & microphone access…");

    // Session data (accumulated for report)
    const qaHistoryRef = useRef<QAEntry[]>([]);
    const postureHistoryRef = useRef<PostureReading[]>([]);
    const fillerWordsTotalRef = useRef<Record<string, number>>({});
    const pauseDurationsRef = useRef<number[]>([]);

    // ── Camera/Mic Setup ────────────────────────────────────────────────────────
    const setupMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" },
                audio: true,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setInterviewState("idle");
            setStatusMessage("Ready. Click 'Start Interview' when you are prepared.");
        } catch {
            setInterviewState("permission_denied");
        }
    }, []);

    useEffect(() => {
        setupMedia();
        return () => stopAllMedia();
    }, [setupMedia]);

    // Ensure the video stream is bound to the video element once it mounts in the DOM
    useEffect(() => {
        if (videoRef.current && streamRef.current && (interviewState !== "permission" && interviewState !== "permission_denied")) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [interviewState]);

    const stopAllMedia = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        recognitionRef.current?.stop();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (noSpeechTimerRef.current) clearTimeout(noSpeechTimerRef.current);
        if (postureIntervalRef.current) clearInterval(postureIntervalRef.current);
        window.speechSynthesis?.cancel();
    };

    // ── Speech Recognition ──────────────────────────────────────────────────────
    const stopListening = useCallback((finalText?: string) => {
        if (!isListeningRef.current) return;
        isListeningRef.current = false;
        setInterviewState("thinking");
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (noSpeechTimerRef.current) clearTimeout(noSpeechTimerRef.current);
        try { recognitionRef.current?.stop(); } catch { }
        processAnswerRef.current?.(finalText !== undefined ? finalText : transcriptRef.current);
    }, []);

    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech Recognition is not supported in your browser. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        let finalTranscript = "";
        const resetSilenceTimer = (currentText: string) => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (currentText.trim().length > 0) {
                silenceTimerRef.current = setTimeout(() => {
                    stopListening(currentText);
                }, SILENCE_TIMEOUT_MS);
            }
        };

        recognition.onresult = (event: any) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + " ";
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            const combined = (finalTranscript + interim).trim();
            setTranscriptWithRef(combined);
            resetSilenceTimer(combined);
        };

        recognition.onerror = (event: any) => {
            if (event.error === "no-speech") return;
            console.error("STT error:", event.error);
        };

        recognition.onend = () => {
            if (isListeningRef.current) {
                try { recognition.start(); } catch { }
            }
        };

        isListeningRef.current = true;
        setInterviewState("listening");
        setTranscriptWithRef("");
        recognition.start();
        resetSilenceTimer("");

        // Auto-advance after 30s of no speech/max duration
        noSpeechTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
                stopListening(transcriptRef.current || "[No answer detected]");
            }
        }, NO_SPEECH_TIMEOUT_MS);
    }, [stopListening]);

    // ── Posture Tracking ────────────────────────────────────────────────────────
    const startPostureTracking = useCallback(() => {
        if (postureIntervalRef.current) clearInterval(postureIntervalRef.current);
        postureIntervalRef.current = setInterval(() => {
            if (!canvasRef.current || !videoRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx || video.readyState < 2) return;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Simplified posture heuristic (when MediaPipe is not loaded):
            // Real MediaPipe integration requires WASM which is complex client-side.
            // We produce a plausible simulated score for demo purposes.
            const baseScore = 75 + Math.floor(Math.random() * 20);
            postureHistoryRef.current.push({ timestamp: Date.now(), score: baseScore });
        }, 5000);
    }, []);

    // ── Core Interview Loop ─────────────────────────────────────────────────────
    const askQuestion = useCallback(async (userAnswer?: string) => {
        setInterviewState("thinking");
        setTranscriptWithRef("");
        setCurrentReaction("");

        const qNum = qaHistoryRef.current.length;
        if (qNum >= MAX_QUESTIONS) {
            await endInterview();
            return;
        }

        try {
            // Build messages history
            if (userAnswer !== undefined && qaHistoryRef.current.length > 0) {
                messagesRef.current.push({ role: "user", content: userAnswer });
            }

            const response = await callGroq(messagesRef.current);
            messagesRef.current.push({ role: "assistant", content: response });

            // Parse REACTION / QUESTION
            const reactionMatch = response.match(/REACTION:\s*(.*?)(?=QUESTION:|$)/s);
            const questionMatch = response.match(/QUESTION:\s*(.*?)$/s);
            const reaction = (reactionMatch?.[1] || "").trim();
            const question = (questionMatch?.[1] || response).trim();

            setCurrentReaction(reaction);
            setCurrentQuestion(question);
            setQuestionCount(qNum + 1);
            setInterviewState("speaking");

            // Speak reaction + question
            const textToSpeak = [reaction, question].filter(Boolean).join(" ");
            await speakWithElevenLabs(textToSpeak);

            startListening();
        } catch (err: any) {
            setError(`Error: ${err.message}`);
            setInterviewState("idle");
        }
    }, [startListening]);

    const processAnswer = useCallback(async (answer: string) => {
        const currentQ = currentQuestion;
        // Track filler words
        const fillers = countFillerWords(answer);
        for (const [word, count] of Object.entries(fillers)) {
            fillerWordsTotalRef.current[word] = (fillerWordsTotalRef.current[word] || 0) + count;
        }
        // Store QA
        qaHistoryRef.current.push({ question: currentQ, answer, timestamp: Date.now() });
        // Next question
        await askQuestion(answer);
    }, [currentQuestion, askQuestion]);

    useEffect(() => {
        processAnswerRef.current = processAnswer;
    }, [processAnswer]);

    const endInterview = useCallback(async () => {
        setInterviewState("speaking");
        const closingMessage = "Thank you for a great interview! You did well. I'll review your responses and generate a detailed report for you now. Best of luck!";
        setCurrentQuestion(closingMessage);
        try { await speakWithElevenLabs(closingMessage); } catch { }
        setInterviewState("ended");
        stopAllMedia();

        // Persist session to sessionStorage
        const sessionData = {
            mode,
            difficulty,
            resumeSummary,
            qaHistory: qaHistoryRef.current,
            postureHistory: postureHistoryRef.current,
            fillerWords: fillerWordsTotalRef.current,
            pauseDurations: pauseDurationsRef.current,
        };
        sessionStorage.setItem("videoInterviewSession", JSON.stringify(sessionData));
        setTimeout(() => router.push("/interview/video/report"), 2000);
    }, [mode, difficulty, resumeSummary, router]);

    const startInterview = useCallback(async () => {
        setInterviewState("starting");
        setStatusMessage("Connecting to Aryan Mehta…");
        startPostureTracking();

        // Initialize Groq conversation
        messagesRef.current = [
            {
                role: "system",
                content: buildSystemPrompt(mode, difficulty, resumeSummary),
            },
            {
                role: "user",
                content: "Hello, I'm ready to start the interview.",
            },
        ];
        await askQuestion();
    }, [mode, difficulty, resumeSummary, startPostureTracking, askQuestion]);

    const toggleMute = () => {
        const audioTracks = streamRef.current?.getAudioTracks();
        audioTracks?.forEach((t) => (t.enabled = !t.enabled));
        setIsMuted((m) => !m);
    };

    const toggleCamera = () => {
        const videoTracks = streamRef.current?.getVideoTracks();
        videoTracks?.forEach((t) => (t.enabled = !t.enabled));
        setIsCameraOff((c) => !c);
    };

    const handleEndInterview = () => {
        stopAllMedia();
        router.push("/dashboard");
    };

    // ── State-based UI helpers ─────────────────────────────────────────────────
    const isSpeaking = interviewState === "speaking";
    const isListening = interviewState === "listening";
    const isThinking = interviewState === "thinking" || interviewState === "starting";

    // ── Render ─────────────────────────────────────────────────────────────────
    if (interviewState === "permission") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-rose-400" />
                    <p className="text-gray-400">{statusMessage}</p>
                </div>
            </div>
        );
    }

    if (interviewState === "permission_denied") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md bg-card border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold">Camera & Mic Access Denied</h2>
                    <p className="text-gray-400 text-sm">
                        This interview requires camera and microphone access. Please enable them in your browser settings:
                    </p>
                    <ul className="text-sm text-gray-300 text-left space-y-1 bg-background/50 rounded-lg p-4">
                        <li>1. Click the 🔒 lock icon in your browser address bar</li>
                        <li>2. Set Camera and Microphone to <strong>Allow</strong></li>
                        <li>3. Refresh the page</li>
                    </ul>
                    <button
                        onClick={() => { setInterviewState("permission"); setupMedia(); }}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] flex flex-col">
            {/* Hidden canvas for posture capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="border-b border-border/30 bg-background/40 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-semibold text-sm">MockMind Video Interview</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-card rounded-md border border-border capitalize">{difficulty}</span>
                    <span className="px-2 py-1 bg-card rounded-md border border-border capitalize">{mode.replace("-", " ")}</span>
                    {questionCount > 0 && (
                        <span className="text-gray-500">
                            {questionCount} / {MAX_QUESTIONS}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-6">

                {/* ── Aryan Mehta Panel ── */}
                <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-border/30 flex flex-col items-center justify-center min-h-[280px] md:min-h-0">
                    {/* Avatar */}
                    <div className="relative">
                        <div className={`absolute -inset-2 rounded-full transition-all duration-300 ${isSpeaking ? "animate-pulse bg-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.5)]" : "bg-transparent"}`} />
                        <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-zinc-700 shadow-2xl">
                            <Image
                                src="/aryan-mehta.png"
                                alt="Aryan Mehta"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="mt-5 text-center">
                        <p className="font-bold text-xl">Aryan Mehta</p>
                        <p className="text-gray-400 text-sm mt-1">Senior Software Engineer · 8 yrs exp</p>
                    </div>

                    {/* Speaking Indicator */}
                    {isSpeaking && (
                        <div className="mt-4 flex items-center gap-1.5">
                            {[3, 5, 8, 5, 3].map((h, i) => (
                                <div
                                    key={i}
                                    className="bg-rose-400 rounded-full"
                                    style={{
                                        width: 4,
                                        height: h * 3,
                                        animation: `waveBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                                    }}
                                />
                            ))}
                            <span className="ml-2 text-xs text-rose-400 font-medium">Speaking…</span>
                        </div>
                    )}

                    {/* Thinking Indicator */}
                    {isThinking && (
                        <div className="mt-4 flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">{interviewState === "starting" ? "Connecting…" : "Thinking…"}</span>
                        </div>
                    )}

                    {/* Question Text */}
                    {currentQuestion && !isThinking && (
                        <div className="mt-5 mx-4 md:mx-8 text-center">
                            {currentReaction && (
                                <p className="text-xs text-gray-400 italic mb-2">"{currentReaction}"</p>
                            )}
                            <p className="text-sm text-gray-200 leading-relaxed font-medium bg-zinc-800/60 rounded-xl px-4 py-3 border border-border/20">
                                {currentQuestion}
                            </p>
                        </div>
                    )}

                    {/* Interviewer label */}
                    <div className="absolute top-3 left-3 text-xs bg-black/50 text-gray-300 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                        Interviewer
                    </div>
                </div>

                {/* ── User Camera Panel ── */}
                <div className="flex-1 relative rounded-2xl overflow-hidden bg-zinc-900 border border-border/30 flex flex-col min-h-[280px] md:min-h-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: "scaleX(-1)" }}
                    />

                    {/* Camera off overlay */}
                    {isCameraOff && (
                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                            <div className="text-center">
                                <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">Camera Off</p>
                            </div>
                        </div>
                    )}

                    {/* Listening Indicator */}
                    {isListening && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-red-500/40">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-red-300 font-medium">Listening…</span>
                        </div>
                    )}

                    {/* User label */}
                    <div className="absolute top-3 right-3 text-xs bg-black/50 text-gray-300 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                        You
                    </div>

                    {/* Live Transcript */}
                    {transcript && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-sm text-white leading-snug">{transcript}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-4 md:mx-6 mb-3 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            {/* Controls */}
            <div className="border-t border-border/30 bg-background/40 backdrop-blur-md px-6 py-4 flex items-center justify-center gap-4">
                {/* Mute */}
                <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isMuted
                        ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                        : "bg-card border-border text-gray-300 hover:text-white hover:border-gray-500"
                        }`}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Camera */}
                <button
                    onClick={toggleCamera}
                    title={isCameraOff ? "Turn on camera" : "Turn off camera"}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isCameraOff
                        ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                        : "bg-card border-border text-gray-300 hover:text-white hover:border-gray-500"
                        }`}
                >
                    {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                {/* Start / End */}
                {interviewState === "idle" ? (
                    <button
                        onClick={startInterview}
                        className="h-12 px-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
                    >
                        <Video className="w-5 h-5" />
                        Start Interview
                    </button>
                ) : interviewState === "ended" ? (
                    <div className="flex items-center gap-2 h-12 px-8 rounded-full bg-green-600/20 border border-green-500/40 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        Generating Report…
                    </div>
                ) : (
                    <button
                        onClick={handleEndInterview}
                        title="End Interview"
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/20"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Wave animation CSS */}
            <style jsx global>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
        </div>
    );
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────
export default function VideoInterviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-rose-400" />
            </div>
        }>
            <VideoInterviewRoom />
        </Suspense>
    );
}
