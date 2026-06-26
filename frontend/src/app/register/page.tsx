"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Frontend");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name, placement_type: role }
        }
      });
      
      if (signUpError) throw signUpError;
      if (!data.session) {
         // User needs to verify email.
         setError("Success! Please check your email to verify your account.");
         setLoading(false);
         return;
      }

      login(data.session.access_token, { id: data.user.id, email, name });
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden p-4 sm:p-8">
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto pt-2 pb-6 z-20 flex-shrink-0">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto p-6 sm:p-10 bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl relative z-10 mt-auto mb-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image src="/logo.png" alt="Mockmind Logo" width={96} height={96} className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-400 mt-2">Join MockAI and start practicing</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg border text-sm text-center ${
            error.startsWith("Success") 
              ? "bg-green-500/10 border-green-500/20 text-green-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">What are you preparing for?</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white appearance-none"
            >
              <option value="Frontend">Frontend Developer</option>
              <option value="Backend">Backend Developer</option>
              <option value="Fullstack">Fullstack Developer</option>
              <option value="System Design">System Design</option>
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="HR">HR / Behavioral</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium shadow-lg hover:bg-primary/90 hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
