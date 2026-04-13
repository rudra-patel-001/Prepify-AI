import { useState } from "react";
import {
  Trophy,
  Star,
  Flame,
  Target,
  TrendingUp,
  CheckCircle,
  Calendar,
  Award,
  Edit3,
  Github,
  Linkedin,
  Globe,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Interviews", value: "48", icon: Target, color: "text-blue-400", bg: "from-blue-500/20 to-blue-500/5" },
  { label: "Quiz Score", value: "84%", icon: TrendingUp, color: "text-purple-400", bg: "from-purple-500/20 to-purple-500/5" },
  { label: "Streak", value: "7d", icon: Flame, color: "text-orange-400", bg: "from-orange-500/20 to-orange-500/5" },
  { label: "Badges", value: "12", icon: Award, color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-500/5" },
];

const badges = [
  { name: "First Interview", desc: "Completed your first mock", icon: "🎯", earned: true },
  { name: "7 Day Streak", desc: "7 consecutive days", icon: "🔥", earned: true },
  { name: "Quiz Master", desc: "100% on any quiz", icon: "🧠", earned: true },
  { name: "Problem Solver", desc: "Solved 50+ problems", icon: "⚡", earned: true },
  { name: "System Expert", desc: "10 system design questions", icon: "🏗️", earned: false },
  { name: "Speed Coder", desc: "Answer in under 30s", icon: "⚡", earned: false },
];

const activityDays = Array.from({ length: 52 * 7 }, (_, i) => ({
  day: i,
  active: Math.random() > 0.6,
  level: Math.floor(Math.random() * 4),
}));

const weekActivity = activityDays.slice(-28);

const recentHistory = [
  { type: "Interview", topic: "Behavioral: Leadership", score: 88, date: "Today", result: "pass" },
  { type: "Quiz", topic: "Data Structures & Algorithms", score: 92, date: "Yesterday", result: "pass" },
  { type: "Interview", topic: "System Design: Twitter", score: 74, date: "2 days ago", result: "pass" },
  { type: "Quiz", topic: "React Advanced Concepts", score: 68, date: "3 days ago", result: "average" },
  { type: "Interview", topic: "Behavioral: Conflict Resolution", score: 95, date: "4 days ago", result: "pass" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "history">("overview");
  const [editing, setEditing] = useState(false);

  return (
    <div className="p-4 md:p-6 page-enter space-y-5">
      {/* Profile header card */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold pulse-glow">
              AK
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a10] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">Alex Kim</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20 font-medium">
                Pro Member
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Senior Frontend Engineer · San Francisco, CA</p>
            <p className="text-sm text-white/60 mt-2 max-w-md">
              Passionate about React and system design. Preparing for FAANG interviews. 
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-3">
              <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
                <Github className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank badge */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-bold gradient-text">#142</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Global Rank</div>
          </div>

          <button
            data-testid="button-edit-profile"
            onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 p-2 rounded-xl glass border-white/8 text-muted-foreground hover:text-white transition-all hover:scale-110"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            data-testid={`card-profile-stat-${i}`}
            className={`rounded-2xl p-4 bg-gradient-to-br ${stat.bg} border border-white/6 hover-scale`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit">
        {(["overview", "badges", "history"] as const).map((tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/20"
                : "text-muted-foreground hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Activity grid */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Activity Heatmap</h2>
              <span className="text-xs text-muted-foreground">Last 28 days</span>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(28, minmax(0, 1fr))" }}>
              {weekActivity.map((day, i) => (
                <div
                  key={i}
                  title={`Day ${i + 1}`}
                  className={cn(
                    "aspect-square rounded-sm transition-all",
                    day.active
                      ? day.level === 3
                        ? "bg-purple-400"
                        : day.level === 2
                        ? "bg-purple-500/60"
                        : "bg-purple-500/30"
                      : "bg-white/5"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {["bg-white/5", "bg-purple-500/30", "bg-purple-500/60", "bg-purple-400"].map((c, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>

          {/* Skills progress */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Skill Progress</h2>
            <div className="space-y-3.5">
              {[
                { skill: "Algorithms & DS", pct: 80, color: "from-purple-500 to-blue-500" },
                { skill: "System Design", pct: 65, color: "from-blue-500 to-cyan-500" },
                { skill: "Behavioral", pct: 90, color: "from-green-500 to-emerald-500" },
                { skill: "React & Frontend", pct: 85, color: "from-pink-500 to-purple-500" },
                { skill: "SQL & Databases", pct: 70, color: "from-orange-500 to-yellow-500" },
              ].map(({ skill, pct, color }, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white/80 font-medium">{skill}</span>
                    <span className="text-sm font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "badges" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <div
              key={i}
              data-testid={`badge-${i}`}
              className={cn(
                "rounded-2xl p-4 border transition-all",
                badge.earned
                  ? "glass-card border-white/8 hover-scale"
                  : "border-white/5 bg-white/2 opacity-50"
              )}
            >
              <div className="text-3xl mb-2">{badge.earned ? badge.icon : "🔒"}</div>
              <div className="text-sm font-semibold text-white mb-1">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.desc}</div>
              {badge.earned && (
                <div className="mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">Earned</span>
                </div>
              )}
              {!badge.earned && (
                <div className="mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white">Activity History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentHistory.map((item, i) => (
              <div
                key={i}
                data-testid={`history-item-${i}`}
                className="flex items-center gap-4 p-4 hover:bg-white/3 transition-all"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  item.type === "Interview" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
                )}>
                  {item.type === "Interview" ? <Zap className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{item.topic}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-bold",
                    item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {item.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
