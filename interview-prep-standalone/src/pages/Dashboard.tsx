import { useState, useEffect } from "react";
import {
  TrendingUp,
  Trophy,
  Target,
  Flame,
  Clock,
  CheckCircle,
  ArrowUp,
  BarChart3,
  Activity,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const progressData = [
  { day: "Mon", score: 62, sessions: 2 },
  { day: "Tue", score: 71, sessions: 3 },
  { day: "Wed", score: 68, sessions: 1 },
  { day: "Thu", score: 78, sessions: 4 },
  { day: "Fri", score: 82, sessions: 3 },
  { day: "Sat", score: 88, sessions: 5 },
  { day: "Sun", score: 91, sessions: 4 },
];

const radarData = [
  { subject: "Algorithms", A: 80 },
  { subject: "System Design", A: 65 },
  { subject: "Behavioral", A: 90 },
  { subject: "SQL", A: 75 },
  { subject: "React", A: 85 },
  { subject: "TypeScript", A: 70 },
];

const recentActivities = [
  { icon: CheckCircle, color: "text-green-400", text: "Completed JavaScript Basics Quiz", time: "2 min ago", score: "+15 pts" },
  { icon: Activity, color: "text-blue-400", text: "Mock Interview: System Design", time: "1 hr ago", score: "+40 pts" },
  { icon: Star, color: "text-yellow-400", text: "Earned 'Problem Solver' badge", time: "3 hrs ago", score: "+100 pts" },
  { icon: Target, color: "text-purple-400", text: "Practice Session: Arrays & Strings", time: "5 hrs ago", score: "+20 pts" },
  { icon: Flame, color: "text-orange-400", text: "7 Day Streak Milestone!", time: "1 day ago", score: "+50 pts" },
];

const statCards = [
  {
    label: "Global Rank",
    value: "#142",
    change: "+23",
    changeLabel: "this week",
    icon: Trophy,
    gradient: "from-yellow-500/20 to-orange-500/10",
    iconGradient: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-400",
    positive: true,
  },
  {
    label: "Progress Score",
    value: "91%",
    change: "+12%",
    changeLabel: "vs last week",
    icon: TrendingUp,
    gradient: "from-purple-500/20 to-blue-500/10",
    iconGradient: "from-purple-500 to-blue-500",
    textColor: "text-purple-400",
    positive: true,
  },
  {
    label: "Quiz Average",
    value: "84/100",
    change: "+6pts",
    changeLabel: "improvement",
    icon: Target,
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconGradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    positive: true,
  },
  {
    label: "Current Streak",
    value: "7 Days",
    change: "Best: 12",
    changeLabel: "days",
    icon: Flame,
    gradient: "from-orange-500/20 to-red-500/10",
    iconGradient: "from-orange-500 to-red-500",
    textColor: "text-orange-400",
    positive: true,
  },
];

function CountUp({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= target) {
          clearInterval(timer);
          return target;
        }
        return prev + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{Math.round(count)}</>;
}

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, Alex <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            You're on a 7-day streak — keep it up!
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white font-medium">Next: React Interview</span>
          <span className="text-xs text-muted-foreground ml-1">in 2h</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            data-testid={`card-stat-${i}`}
            className={`relative overflow-hidden rounded-2xl border border-white/8 p-5 hover-scale cursor-default bg-gradient-to-br ${card.gradient}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">{card.change}</span>
              </div>
            </div>
            <div className={`text-2xl font-bold ${card.textColor} mb-1`}>{card.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{card.changeLabel}</div>

            {/* Background glow */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-purple-500 to-blue-500" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Weekly Progress</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Score trend over this week</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ background: "rgba(13,13,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                cursor={{ stroke: "rgba(168,85,247,0.3)", strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} fill="url(#scoreGradient)" dot={{ fill: "#a855f7", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#a855f7" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Radar */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Skill Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your proficiency areas</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your latest sessions and achievements</p>
          </div>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium" data-testid="button-view-all-activity">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, i) => (
            <div
              key={i}
              data-testid={`activity-item-${i}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 font-medium truncate">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
              <div className="text-xs font-semibold text-green-400 flex-shrink-0">{activity.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
