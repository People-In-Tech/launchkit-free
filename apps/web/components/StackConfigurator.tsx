"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Database, Lock, CreditCard, Terminal, Copy } from "lucide-react";

type StackOption = {
  id: string;
  name: string;
  icon: string;
  badge?: string;
};

// Auth: Clerk only (the only supported auth provider)
const authProviders: StackOption[] = [
  { id: "clerk", name: "Clerk", icon: "/logos/clerk.svg", badge: "Recommended" },
];

// Payments: Stripe only (Apple Pay, Google Pay, Link — all built-in)
const paymentProviders: StackOption[] = [
  { id: "stripe", name: "Stripe", icon: "/logos/stripe.svg", badge: "Recommended" },
];

// Database: Neon or Supabase
const databases: StackOption[] = [
  { id: "neon", name: "Neon", icon: "/logos/neon.svg", badge: "Recommended" },
  { id: "supabase", name: "Supabase", icon: "/logos/supabase.svg" },
];

export function StackConfigurator() {
  const [db, setDb] = useState(databases[0].id);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    const cmd = `npx create-launchkit@latest my-app --db=${db}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border bg-background/50 p-6 backdrop-blur-xl shadow-2xl shadow-primary/5">
      <div className="flex items-center gap-2 mb-6">
        <Terminal className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Configure your stack</h3>
      </div>

      {/* Step 1: Auth → Step 2: Payments → Step 3: Database */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Step 1 — Auth */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
            <Lock className="h-4 w-4" /> Auth
          </div>
          <div className="flex flex-col gap-2">
            {authProviders.map((option) => (
              <button
                key={option.id}
                disabled
                className="relative flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary font-medium cursor-default"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="h-4 w-4 object-contain rounded-sm bg-white"
                  />
                  <span>{option.name}</span>
                </div>
                <Check className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Payments */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
            <CreditCard className="h-4 w-4" /> Payments
          </div>
          <div className="flex flex-col gap-2">
            {paymentProviders.map((option) => (
              <button
                key={option.id}
                disabled
                className="relative flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary font-medium cursor-default"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="h-4 w-4 object-contain rounded-sm bg-white"
                  />
                  <span>{option.name}</span>
                </div>
                <Check className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Database (the only real choice) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold">3</span>
            <Database className="h-4 w-4" /> Database
          </div>
          <div className="flex flex-col gap-2">
            {databases.map((option) => (
              <button
                key={option.id}
                onClick={() => setDb(option.id)}
                className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  db === option.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="h-4 w-4 object-contain rounded-sm bg-white"
                  />
                  <span>{option.name}</span>
                </div>
                {db === option.id && (
                  <motion.div layoutId="db-check" className="absolute right-3">
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal block */}
      <div className="relative rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-50 overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Window chrome */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <button
            onClick={copyCommand}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
          >
            <Copy className="h-3 w-3" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Single command — matches terminal demo style */}
        <AnimatePresence mode="wait">
          <motion.div
            key={db}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-cyan-300">npx</span>{" "}
            <span className="text-zinc-100">create-launchkit@latest</span>{" "}
            <span className="text-zinc-300">my-app</span>{" "}
            <span className="text-amber-300">--db={db}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Start with the{" "}
        <a
          href="https://github.com/CalebKing3/launchkit"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          free template
        </a>
        {" "}— the CLI handles env setup, migrations, and first deploy.
      </p>
    </div>
  );
}
