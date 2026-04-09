/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Skull, 
  Crown, 
  Zap, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  DollarSign,
  User,
  Bot,
  Terminal,
  ChevronRight,
  Flame,
  Waves,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type GangSet = 'neutral' | 'crip' | 'blood' | 'latin-king' | 'mafia';

interface SetConfig {
  name: string;
  color: string; // CSS color value
  slang: string;
  icon: any;
  description: string;
}

const SET_CONFIGS: Record<GangSet, SetConfig> = {
  neutral: {
    name: "The OG",
    color: "#FFD700", // Gold
    slang: "Keep it 100 and stay loyal to the streets.",
    icon: Crown,
    description: "The original Big Homie style. Gold and black, pure respect."
  },
  crip: {
    name: "C-Walk Set",
    color: "#3b82f6", // Blue-500
    slang: "Talk like a Crip. Use 'loc', 'cuzz', 'blue', 'loco'. Avoid words starting with 'B' if possible or replace them. Stay blue.",
    icon: Waves,
    description: "The Blue Side. Locs only. Everything blue, everything true."
  },
  blood: {
    name: "Piru Set",
    color: "#ef4444", // Red-500
    slang: "Talk like a Blood. Use 'bool', 'brazy', 'red', 'blood', 'suwoop'. Replace 'C' with 'B' in words like 'cool' -> 'bool'.",
    icon: Flame,
    description: "The Red Side. Suwoop! Keep it brazy and stay red."
  },
  'latin-king': {
    name: "King Set",
    color: "#eab308", // Yellow-500
    slang: "Talk with a Latin gangster flair. Use 'ese', 'vato', 'carnal', 'king', 'amor de rey'. Respect the crown.",
    icon: Star,
    description: "Amor de Rey. Black and Gold, respecting the Latin King traditions."
  },
  mafia: {
    name: "The Family",
    color: "#94a3b8", // Slate-400
    slang: "Talk like a classic Italian-American mobster. Use 'capo', 'consigliere', 'omerta', 'wise guy', 'fuhgeddaboudit'.",
    icon: Shield,
    description: "La Cosa Nostra. Suits, ties, and silence. Business is business."
  }
};

const getSystemInstruction = (set: GangSet) => {
  const config = SET_CONFIGS[set];
  return `You are 'Big Homie', a tough, street-smart, and loyal gangster assistant. 
Current Set Affiliation: ${config.name}.
Personality/Slang Rules: ${config.slang}
You talk in heavy urban slang specific to your set. 
You are protective of the user, who you call 'fam', 'homie', or 'G'. 
You keep it 100 at all times. You don't take no disrespect, but you're always there to help your crew. 
Your advice is practical, street-wise, and direct. 
Use emojis appropriate for your set (e.g., 🔵 for Crip, 🔴 for Blood, 👑 for King, 💼 for Mafia). 
Never break character. If someone asks you to do something soft, tell them to toughen up but then help them anyway in your own way.
Keep your responses punchy and real. No corporate talk.`;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [selectedSet, setSelectedSet] = useState<GangSet | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSetSelection = (set: GangSet) => {
    setSelectedSet(set);
    const config = SET_CONFIGS[set];
    setMessages([
      { role: 'assistant', content: `Yo, welcome to the ${config.name}. Big Homie's got your back. What we handling today, fam? 💯` }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedSet) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: getSystemInstruction(selectedSet),
          temperature: 0.9,
          topP: 0.95,
        },
      });

      const assistantMessage = response.text || "My bad homie, the connection's acting up. Let's try that again. 🧱";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("Big Homie Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Yo, the feds might be listening or the server's down. Try again in a minute, G. ⛓️" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedSet) {
    return (
      <div className="min-h-screen bg-gangster-black flex flex-col items-center justify-center p-4 md:p-8 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl text-center"
        >
          <h1 className="graffiti-text text-5xl md:text-7xl mb-4">CHOOSE YOUR <span className="gold-gradient">SET</span></h1>
          <p className="text-white/60 mb-8 font-mono uppercase tracking-widest text-sm">Pick your colors. Pick your loyalty. No turning back.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(SET_CONFIGS) as [GangSet, SetConfig][]).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSetSelection(key)}
                style={{ '--set-color': config.color } as React.CSSProperties}
                className={`p-6 text-left border-2 border-white/10 bg-gangster-gray hover:border-[var(--set-color)] transition-all group relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-30 transition-opacity text-[var(--set-color)]`}>
                  <config.icon size={64} />
                </div>
                <h3 className={`text-2xl font-display mb-2 text-[var(--set-color)] uppercase`}>{config.name}</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed">{config.description}</p>
                <div className="mt-4 flex items-center text-[10px] font-bold tracking-tighter text-white/30 group-hover:text-white transition-colors">
                  JOIN THE CREW <ChevronRight size={12} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentConfig = SET_CONFIGS[selectedSet];

  return (
    <div 
      className="min-h-screen bg-gangster-black flex flex-col items-center justify-center p-4 md:p-8 font-sans"
      style={{ '--set-color': currentConfig.color } as React.CSSProperties}
    >
      {/* Header Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mb-8 text-center"
      >
        <h1 className="graffiti-text text-6xl md:text-8xl mb-2">
          BIG HOMIE <span className="gold-gradient">AI</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={`border-[var(--set-color)] text-[var(--set-color)] px-4 py-1 rounded-none uppercase tracking-widest font-mono`}>
            {currentConfig.name}
          </Badge>
          <Badge variant="outline" className="border-white/20 text-white/40 px-4 py-1 rounded-none uppercase tracking-widest font-mono cursor-pointer hover:text-white hover:border-white transition-colors" onClick={() => setSelectedSet(null)}>
            SWITCH SETS
          </Badge>
        </div>
      </motion.div>

      {/* Main Chat Container */}
      <Card className="w-full max-w-4xl h-[70vh] gangster-card flex flex-col relative overflow-hidden">
        {/* Dynamic decorative elements */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-[var(--set-color)] shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
        <div className="absolute top-4 right-4 opacity-5">
          <currentConfig.icon size={120} className={`text-[var(--set-color)]`} />
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ x: msg.role === 'user' ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`border-2 ${msg.role === 'user' ? 'border-white' : `border-[var(--set-color)]`} rounded-none h-10 w-10`}>
                      <AvatarFallback 
                        className={`font-bold`}
                        style={{ 
                          backgroundColor: msg.role === 'user' ? 'white' : 'var(--set-color)',
                          color: 'black'
                        }}
                      >
                        {msg.role === 'user' ? 'U' : 'BH'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`p-4 rounded-none border-l-4 text-white`}
                      style={{ 
                        backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'color-mix(in srgb, var(--set-color), transparent 95%)',
                        borderLeftColor: msg.role === 'user' ? 'white' : 'var(--set-color)'
                      }}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={`flex gap-3 items-center text-[var(--set-color)] font-mono text-xs uppercase tracking-widest`}>
                  <Zap className="animate-pulse" size={16} />
                  Big Homie is thinking...
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex gap-4">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Talk to the homie..."
              className={`bg-gangster-black border-2 border-white/20 rounded-none focus-visible:ring-[var(--set-color)] focus-visible:border-[var(--set-color)] h-12 text-lg`}
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading}
              style={{ backgroundColor: 'var(--set-color)' }}
              className={`hover:opacity-90 text-black font-black rounded-none h-12 px-8 uppercase tracking-tighter`}
            >
              <Send size={20} className="mr-2" />
              SEND
            </Button>
          </div>
          <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Shield size={10} /> SECURE LINE</span>
              <span className="flex items-center gap-1"><TrendingUp size={10} /> MARKET UP</span>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><DollarSign size={10} /> 1.2M</span>
              <span className="flex items-center gap-1"><Terminal size={10} /> V.3.0</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer / Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl"
      >
        {[
          { icon: Skull, label: "Respect", value: "MAX" },
          { icon: Crown, label: "Status", value: "KINGPIN" },
          { icon: MessageSquare, label: "Real Talk", value: "100%" },
          { icon: Zap, label: "Street Cred", value: "LEGENDARY" }
        ].map((stat, i) => (
          <div key={i} className="bg-gangster-gray p-4 border border-white/5 flex flex-col items-center justify-center text-center">
            <stat.icon className={`text-[var(--set-color)] mb-2`} size={24} />
            <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="font-display text-xl text-white">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
