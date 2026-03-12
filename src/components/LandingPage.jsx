import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Wallet, ShieldCheck, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate=useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">

      {/* GLOW ORBS */}
      <div className="absolute -top-40 -left-40 w-125 h-125 bg-indigo-600/30 blur-[180px] rounded-full" />
      <div className="absolute top-1/3 -right-40 w-125 h-125 bg-purple-600/30 blur-[180px] rounded-full" />

      {/* HERO */}
      <section className="relative px-6 py-32 text-center max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight"
        >
          Track Every Rupee.
          <span className="block bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Grow Smarter.
          </span>
        </motion.h1>

        <p className="mt-8 text-slate-300 text-xl max-w-2xl mx-auto">
          A next-gen fund tracking platform to monitor trades, analyze performance,
          and scale your wealth with data-driven precision.
        </p>

        <div className="mt-12 flex justify-center gap-6">
          <Button onClick={()=> navigate("/dashboard")} className="text-lg px-10 py-7 rounded-2xl shadow-xl hover:scale-105 transition">
            Get Started
          </Button>
          <Button
            variant="outline"
            className="text-lg px-10 py-7 rounded-2xl border-indigo-400 text-indigo-400 hover:bg-indigo-400/10"
          >
            Live Demo
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl shadow-2xl hover:scale-105 hover:border-indigo-400/40 transition-all">
              <CardContent className="p-8 text-center">
                <f.icon className="mx-auto mb-5 text-slate-400" size={40} />
                <h3 className="text-xl font-semibold mb-2 text-slate-300">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* STATS */}
      <section className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-14 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {s.value}
            </h2>
            <p className="mt-3 text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="relative text-center py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-[3rem] max-w-4xl mx-auto p-20 shadow-[0_0_80px_rgba(99,102,241,0.6)]"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Build Wealth With Clarity
          </h2>
          <p className="mt-5 text-indigo-100 text-lg">
            Stop guessing. Start growing with intelligent fund tracking.
          </p>
          <Button onClick={()=> navigate("/dashboard")} className="mt-10 text-lg px-12 py-7 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 hover:scale-105 transition">
            Launch App
          </Button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative text-center py-12 text-slate-500">
        © {new Date().getFullYear()} FundTracker — Smart investing simplified.
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Live Trade Tracking",
    desc: "Real-time market synced trade monitoring.",
    icon: TrendingUp,
  },
  {
    title: "Smart Analytics",
    desc: "Performance charts & AI-driven insights.",
    icon: LineChart,
  },
  {
    title: "Bank-Grade Security",
    desc: "Encrypted APIs + token based auth.",
    icon: ShieldCheck,
  },
  {
    title: "Unified Portfolio",
    desc: "All investments in one premium dashboard.",
    icon: Wallet,
  },
];

const stats = [
  { value: "24/7", label: "Live Markets" },
  { value: "99.9%", label: "Uptime" },
  { value: "Fast", label: "Execution Speed" },
];