"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { Target, Trophy, TrendingUp, Calendar, ArrowRight, Building2, Briefcase, FileText, Code2, Users, Trash2, Video } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MagicCard } from "@/components/ui/magic-card";
import api from "@/lib/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    streak: 0
  });

  useEffect(() => {
    if (user) {
      api.get("/api/dashboard/history").then((res) => {
        setRecentInterviews(res.data);
        if (res.data.length > 0) {
          const scores = res.data.map((i: any) => i.score);
          const max = Math.max(...scores);
          const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          setStats(prev => ({ ...prev, totalInterviews: res.data.length, bestScore: max, averageScore: avg, streak: 1 }));
        }
      }).catch(console.error);
    }
  }, [user]);

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to delete all your interview history? This cannot be undone.")) {
      try {
        await api.delete("/api/dashboard/history");
        setRecentInterviews([]);
        setStats({ totalInterviews: 0, averageScore: 0, bestScore: 0, streak: 0 });
      } catch (error) {
        console.error("Failed to clear history", error);
        alert("Failed to clear history");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 pt-28 md:pt-32 pb-8 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"} 👋</h1>
            <p className="text-gray-400 mt-2">Ready to level up your interview skills today?</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Interviews", value: <NumberTicker value={stats.totalInterviews} className="text-white" />, icon: <Target className="w-5 h-5 text-blue-400" /> },
            { label: "Average Score", value: <><NumberTicker value={stats.averageScore} decimalPlaces={1} className="text-white" />/100</>, icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
            { label: "Best Score", value: <><NumberTicker value={stats.bestScore} decimalPlaces={1} className="text-white" />/100</>, icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
            { label: "Current Streak", value: <><NumberTicker value={stats.streak} className="text-white" /> Days</>, icon: <Calendar className="w-5 h-5 text-orange-400" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/50 border border-border/50 rounded-2xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-background rounded-lg p-2">{stat.icon}</div>
                <span className="text-sm font-medium text-gray-400">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main Pathways (lg:col-span-2) ── */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Select Interview Type</h2>

            {/* On-Campus + Off-Campus cards */}
            <div className="grid sm:grid-cols-2 gap-6">

              {/* On-Campus Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link href={`/interview/setup?type=on-campus`} className="block h-full group">
                  <MagicCard
                    glowFrom="#3b82f6"
                    glowTo="#60a5fa"
                    className="p-6 md:p-8 rounded-3xl border bg-blue-500/10 border-blue-500/20 transition-all h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-background/80 rounded-2xl p-4 shadow-sm border border-blue-500/30">
                        <Building2 className="w-8 h-8 text-blue-400" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-2xl mb-2">On-Campus Placement</h3>
                    <p className="text-sm text-gray-300 mb-6">
                      Structured company interview format. Standardized rigorous testing.
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Roadmap</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">Aptitude</span>
                        <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">DSA</span>
                        <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">DBMS / OS</span>
                        <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">HR</span>
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </motion.div>

              {/* Off-Campus Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link href={`/interview/setup?type=off-campus`} className="block h-full group">
                  <MagicCard
                    glowFrom="#a855f7"
                    glowTo="#c084fc"
                    className="p-6 md:p-8 rounded-3xl border bg-purple-500/10 border-purple-500/20 transition-all h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-background/80 rounded-2xl p-4 shadow-sm border border-purple-500/30">
                        <Briefcase className="w-8 h-8 text-purple-400" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-2xl mb-2">Off-Campus Placement</h3>
                    <p className="text-sm text-gray-300 mb-6">
                      Tailored specifically to your Resume and targeted Job Role.
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Requirements</div>
                      <div className="flex flex-col gap-2 text-sm text-gray-300">
                        <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400" /> Upload Resume</div>
                        <div className="flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> Select Target Role</div>
                        <div className="flex items-center gap-2"><Code2 className="w-4 h-4 text-purple-400" /> AI parses skills</div>
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </motion.div>
            </div>

            {/* AI Video Interview Card — full-width banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/interview/video/setup" className="block group">
                <MagicCard
                  glowFrom="#f43f5e"
                  glowTo="#ec4899"
                  className="p-6 md:p-8 rounded-3xl border bg-rose-500/10 border-rose-500/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-start gap-5 flex-1">
                      <div className="bg-background/80 rounded-2xl p-4 shadow-sm border border-rose-500/30 flex-shrink-0">
                        <Video className="w-8 h-8 text-rose-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-2xl">AI Video Interview</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium">NEW</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Face-to-face mock interview with <span className="font-semibold text-rose-300">Aryan Mehta</span> — Senior SWE, 8 yrs exp. AI voice, posture tracking &amp; detailed report.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs flex-shrink-0 items-center">
                      <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">🎙️ Voice</span>
                      <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">📷 Camera</span>
                      <span className="px-2 py-1 bg-background/60 rounded-md border border-border/50">📊 AI Report</span>
                      <ArrowRight className="w-5 h-5 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all hidden md:block" />
                    </div>
                  </div>
                </MagicCard>
              </Link>
            </motion.div>
          </div>

          {/* ── Recent History ── */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent History</h2>
              <div className="flex items-center gap-4">
                {recentInterviews.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Clear
                  </button>
                )}
                <Link href="/profile" className="text-sm text-primary hover:underline">View all</Link>
              </div>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm">
              {recentInterviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No interviews yet. Start your first one above!
                </div>
              ) : (
                recentInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/interview/result/${interview.id}`}
                    className="block p-4 border-b border-border/50 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{interview.topic}</h3>
                        <span className="text-xs text-gray-400 bg-background px-2 py-0.5 rounded border border-border">
                          {interview.type}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${interview.score >= 80 ? "bg-green-500/20 text-green-400" :
                          interview.score >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                        }`}>
                        {interview.score}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                      <span>{interview.date}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
