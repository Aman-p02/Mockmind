"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Mic, Code, LineChart, ArrowRight, CheckCircle2, UserCog, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { SquigglyText } from "@/components/ui/squiggly-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import ColourfulText from "@/components/ui/colourful-text";
import { Button as MovingBorder } from "@/components/ui/moving-border";

export const features = [
  {
    title: "AI-Powered Scenarios",
    description: "Dynamic questions tailored to your target role (Frontend, Backend, System Design, HR, etc.)",
    link: "#",
    icon: <Bot className="h-8 w-8 text-primary" />,
  },
  {
    title: "Voice & Text Modes",
    description: "Practice speaking naturally with our built-in speech recognition, or type your answers.",
    link: "#",
    icon: <Mic className="h-8 w-8 text-purple-400" />,
  },
  {
    title: "Detailed Feedback",
    description: "Get instant scores, strengths, and areas for improvement after every mock interview.",
    link: "#",
    icon: <LineChart className="h-8 w-8 text-green-400" />,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="min-h-screen w-full relative">
          <AuroraBackground className="w-full h-full absolute inset-0 !bg-[#080808]">
            <div className="p-4 max-w-7xl mx-auto relative z-30 w-full pt-20 md:pt-0">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-7xl font-bold text-center text-white mb-6 tracking-tight flex flex-col items-center justify-center md:block"
              >
                <span>Practice Interviews Like </span>
                <SquigglyText
                  stepDuration={70}
                  scale={[6, 9]}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))] md:ml-4"
                >
                  Real Companies Ask.
                </SquigglyText>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 font-normal text-lg md:text-xl text-neutral-300 max-w-2xl text-center mx-auto mb-10"
              >
                <TextGenerateEffect
                  words="Ace your next job interview with dynamic AI-generated questions, voice and text responses, and instant actionable feedback."
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/register"
                  className="group relative inline-flex h-12 md:h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-transform hover:scale-105"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#080808] px-8 py-1 text-sm md:text-base font-medium text-white backdrop-blur-3xl">
                    <span>Start Practicing Free</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
            </motion.div>
          </div>
          </AuroraBackground>
        </section>

        {/* Features Section with Hover Effect */}
        <section className="py-24 bg-[#050505] border-y border-border/40">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <ColourfulText text="MockAI?" /></h2>
              <div className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
                <TextGenerateEffect
                  words="Everything you need to build confidence and land your dream job."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
              {features.map((feature, idx) => (
                <CardContainer key={idx} className="inter-var w-full">
                  <HoverBorderGradient
                    containerClassName="w-full h-full rounded-xl"
                    className="w-full h-full p-0 bg-transparent"
                    as="div"
                  >
                    <CardBody className="bg-zinc-950 relative group/card hover:shadow-2xl hover:shadow-primary/[0.1] w-full h-full rounded-xl p-8 flex flex-col items-start justify-start transition-all duration-300">
                      <CardItem
                        translateZ="50"
                        className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-6"
                      >
                        {feature.icon}
                      </CardItem>
                      <CardItem
                        as="h3"
                        translateZ="60"
                        className="text-xl font-bold text-white mb-4"
                      >
                        {feature.title}
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="80"
                        className="text-gray-400 text-sm leading-relaxed"
                      >
                        {feature.description}
                      </CardItem>
                    </CardBody>
                  </HoverBorderGradient>
                </CardContainer>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-[#080808] relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
            </div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-stretch gap-10 md:gap-4">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-zinc-800">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 origin-left shadow-[0_0_10px_#3b82f6]"
                />
              </div>

              {/* Mobile Connecting Line */}
              <div className="md:hidden absolute left-[27px] top-[10%] bottom-[10%] w-[2px] bg-zinc-800">
                <motion.div 
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-b from-blue-600 via-blue-400 to-blue-600 origin-top shadow-[0_0_10px_#3b82f6]"
                />
              </div>
              
              {[
                { step: "1", customImage: "/choose-role.png", title: "Choose Role", desc: "Select your target job role and difficulty level." },
                { step: "2", customImage: "/give-interview.png", title: "Give Interview", desc: "Answer technical and HR questions in real-time." },
                { step: "3", customImage: "/get-score.png", title: "Get Score", desc: "Receive comprehensive AI feedback and scores." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  className="relative z-10 flex flex-row md:flex-col items-center md:items-center w-full md:w-1/3 gap-6 md:gap-8"
                >
                  <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#080808] border-2 border-blue-500 flex flex-col items-center justify-center text-xl md:text-2xl font-bold text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] z-20 text-center leading-none">
                    {item.step}
                  </div>
                  <MovingBorder
                    as="div"
                    containerClassName="w-full flex-1 h-full"
                    borderRadius="1rem"
                    className="bg-[#0a0a0a] p-6 md:p-8 w-full text-left md:text-center shadow-xl hover:bg-[#111111] transition-colors flex-col"
                  >
                    {item.customImage && (
                      <div className="flex justify-center mb-6">
                        <img src={item.customImage} alt={item.title} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                      </div>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">{item.desc}</p>
                  </MovingBorder>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
