"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, User as UserIcon, Calendar, Target, Trophy, Star, BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/user/profile"),
      api.get("/api/dashboard/history")
    ])
      .then(([profileRes, historyRes]) => {
        const pData = profileRes.data;
        const history = historyRes.data || [];
        
        const scores = history.map((h: any) => h.score || 0);
        const max = scores.length > 0 ? Math.max(...scores) : 0;
        const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

        const progressData = history.slice().reverse().map((h: any, i: number) => ({
          name: `Int ${i + 1}`,
          score: h.score || 0
        }));

        const topicMap: any = {};
        history.forEach((h: any) => {
          if (!topicMap[h.topic]) topicMap[h.topic] = { total: 0, count: 0 };
          topicMap[h.topic].total += (h.score || 0);
          topicMap[h.topic].count += 1;
        });

        const topicPerformance = Object.keys(topicMap).map(k => ({
          topic: k,
          score: Math.round(topicMap[k].total / topicMap[k].count)
        }));

        const favoriteTopic = topicPerformance.length > 0 ? topicPerformance.sort((a,b) => b.count - a.count)[0]?.topic : 'N/A';

        setProfileData({
          ...pData,
          memberSince: new Date(pData.created_at || Date.now()).getFullYear(),
          totalInterviews: history.length,
          averageScore: avg.toFixed(1),
          bestScore: max,
          favoriteTopic: favoriteTopic || 'N/A',
          strengths: ["Clear Communication", "Problem Solving"],
          improvements: ["Advanced System Design", "Optimization"],
          progressData: progressData.length > 0 ? progressData : [{ name: 'Int 1', score: 0 }],
          topicPerformance: topicPerformance.length > 0 ? topicPerformance : [{ topic: 'General', score: 0 }]
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch profile", error);
        setLoading(false);
      });
  }, []);

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 pt-28 md:pt-32 pb-8 md:pb-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Info & Stats */}
          <div className="space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-3xl p-8 text-center"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-xl">
                <UserIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{user?.name || "Mock User"}</h1>
              <p className="text-gray-400">{user?.email || "user@example.com"}</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Member since {profileData.memberSince}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Total Interviews", value: profileData.totalInterviews, icon: <Target className="text-blue-400" /> },
                { label: "Average Score", value: profileData.averageScore, icon: <Star className="text-yellow-400" /> },
                { label: "Best Score", value: profileData.bestScore, icon: <Trophy className="text-green-400" /> },
                { label: "Favorite Topic", value: profileData.favoriteTopic, icon: <BookOpen className="text-purple-400" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5">
                  <div className="bg-background rounded-lg p-2 inline-block mb-3">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Strengths & Improvements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Top Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.strengths || []).map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> Areas to Improve</h3>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.improvements || []).map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Charts & History */}
          <div className="lg:col-span-2 space-y-8">


            {/* Topic Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold mb-6">Topic Performance</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profileData.topicPerformance} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#888" axisLine={false} tickLine={false} />
                    <YAxis dataKey="topic" type="category" stroke="#888" axisLine={false} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '12px' }}
                      cursor={{fill: '#222'}}
                    />
                    <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
