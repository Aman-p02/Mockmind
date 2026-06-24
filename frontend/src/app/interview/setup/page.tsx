"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Check, ChevronRight, Upload, File as FileIcon, X, Loader2, Building2, Briefcase, LayoutTemplate, Server, Database, Code2, Terminal, Users, Layers } from "lucide-react";
import api from "@/lib/api";

function SetupForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "off-campus"; // on-campus or off-campus
  const router = useRouter();

  // Common State
  const [mode, setMode] = useState("text");
  const [loading, setLoading] = useState(false);

  // On-Campus State
  const [difficulty, setDifficulty] = useState("medium");

  // Off-Campus State
  const [role, setRole] = useState("frontend");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles = [
    { id: "frontend", name: "Frontend", icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: "backend", name: "Backend", icon: <Server className="w-5 h-5" /> },
    { id: "fullstack", name: "Full Stack", icon: <Layers className="w-5 h-5" /> },
    { id: "prompt-engineering", name: "Prompt Engineering", icon: <Terminal className="w-5 h-5" /> },
    { id: "devops", name: "DevOps", icon: <Database className="w-5 h-5" /> },
    { id: "dsa", name: "DSA & Problem Solving", icon: <Code2 className="w-5 h-5" /> },
    { id: "hr", name: "HR & Behavioral", icon: <Users className="w-5 h-5" /> },
  ];

  const difficulties = [
    { id: "easy", name: "Easy", desc: "Basic concepts and definitions" },
    { id: "medium", name: "Medium", desc: "Practical scenarios and problem-solving" },
    { id: "hard", name: "Hard", desc: "Advanced architectures and optimizations" },
  ];

  const modes = [
    { id: "text", name: "Text Mode", desc: "Type your answers. Great for coding rounds." },
    { id: "voice", name: "Voice Mode", desc: "Speak your answers. Great for HR & System Design." },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      let res;
      if (type === "on-campus") {
        res = await api.post("/api/interview/start", {
          type: "on-campus",
          difficulty,
          mode
        });
      } else {
        // Off-Campus (requires FormData due to file upload)
        if (!resumeFile) {
          alert("Please upload your resume first.");
          setLoading(false);
          return;
        }

        // 1. Upload and parse resume
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("targetDomain", role);

        await api.post("/api/resume/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // 2. Start Interview
        res = await api.post("/api/interview/start-offcampus", {
          domain: role,
          mode
        });
      }

      if (res.data.interviewId) {
        router.push(`/interview/${res.data.interviewId}?mode=${mode}`);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to start interview", error);
      const backendError = error.response?.data?.error;
      alert(backendError || "Failed to start interview. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {type === "on-campus" ? (
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Building2 className="w-6 h-6" /></div>
          ) : (
            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Briefcase className="w-6 h-6" /></div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            {type === "on-campus" ? "On-Campus Interview" : "Off-Campus Interview"}
          </h1>
        </div>
        <p className="text-gray-400">
          {type === "on-campus" 
            ? "Configure your structured company placement drive." 
            : "Tailor the mock interview to match your Resume and target Job Role."}
        </p>
      </div>

      <div className="space-y-10">
        
        {/* Type Specific Sections */}
        {type === "on-campus" ? (
          <>
            {/* On-Campus Roadmap Info */}
            <section className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-400 flex items-center gap-2">
                <Check className="w-5 h-5" /> Standardized Roadmap
              </h2>
              <p className="text-sm text-gray-300 mb-6">
                This interview follows a fixed flow designed to mimic top-tier company placement drives. Gemini AI will generate questions for each phase in sequence:
              </p>
              <div className="flex flex-col md:flex-row gap-2 justify-between items-center text-sm font-medium">
                <div className="bg-background px-4 py-2 border border-border rounded-lg text-center w-full">1. Aptitude</div>
                <ChevronRight className="w-5 h-5 text-gray-500 hidden md:block" />
                <div className="bg-background px-4 py-2 border border-border rounded-lg text-center w-full">2. DSA</div>
                <ChevronRight className="w-5 h-5 text-gray-500 hidden md:block" />
                <div className="bg-background px-4 py-2 border border-border rounded-lg text-center w-full">3. DBMS</div>
                <ChevronRight className="w-5 h-5 text-gray-500 hidden md:block" />
                <div className="bg-background px-4 py-2 border border-border rounded-lg text-center w-full">4. OS</div>
                <ChevronRight className="w-5 h-5 text-gray-500 hidden md:block" />
                <div className="bg-background px-4 py-2 border border-border rounded-lg text-center w-full">5. HR</div>
              </div>
            </section>

            {/* Difficulty Selection */}
            <section>
              <h2 className="text-xl font-bold mb-4">1. Select Difficulty</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`text-left p-5 rounded-xl border transition-all relative ${
                      difficulty === d.id
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
          </>
        ) : (
          <>
            {/* Off-Campus Resume Upload */}
            <section>
              <h2 className="text-xl font-bold mb-4">1. Upload Resume</h2>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  resumeFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-card/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                
                {!resumeFile ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-background p-4 rounded-full mb-4 border border-border shadow-sm">
                      <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="font-medium text-lg mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400 mb-6">PDF, DOC, or DOCX (Max 5MB)</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl font-medium transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-xs text-gray-400">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setResumeFile(null)}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Role Selection */}
            <section>
              <h2 className="text-xl font-bold mb-4">2. Select Target Role</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                      role === r.id
                        ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] text-primary"
                        : "bg-card border-border hover:border-gray-500 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {r.icon}
                    <span className="text-sm font-medium text-center leading-tight">{r.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Mode Selection */}
        <section>
          <h2 className="text-xl font-bold mb-4">{type === "on-campus" ? "2. Select Mode" : "3. Select Mode"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-left p-5 rounded-xl border transition-all relative ${
                  mode === m.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-gray-500"
                }`}
              >
                {mode === m.id && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <h3 className={`font-bold mb-1 ${mode === m.id ? "text-primary" : ""}`}>{m.name}</h3>
                <p className="text-sm text-gray-400">{m.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <div className="pt-6 border-t border-border flex justify-end">
          <button
            onClick={handleStart}
            disabled={loading || (type === "off-campus" && !resumeFile)}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Generate Interview"}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex pt-28 md:pt-32">
        <Suspense fallback={<div className="p-8 text-center w-full mt-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
          <SetupForm />
        </Suspense>
      </main>
    </div>
  );
}
