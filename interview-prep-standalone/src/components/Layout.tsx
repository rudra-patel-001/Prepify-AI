import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  Brain,
  User,
  Bell,
  Search,
  ChevronRight,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Video, label: "Interview", path: "/interview" },
  { icon: MessageSquare, label: "Chatbot", path: "/chatbot" },
  { icon: Brain, label: "Quiz", path: "/quiz" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden dark">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 w-64 flex flex-col transition-transform duration-300",
          "border-r border-white/5",
          "bg-[#0d0d14]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">PrepAI</span>
            <div className="text-[10px] text-purple-400/70 font-medium uppercase tracking-widest">Pro</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 mb-3 font-semibold">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                    isActive
                      ? "sidebar-active text-white"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-purple-400" : "text-muted-foreground group-hover:text-white"
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-purple-400 ml-auto" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                AK
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d14]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Alex Kim</div>
              <div className="text-[10px] text-muted-foreground truncate">Pro Member</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 flex items-center px-4 md:px-6 gap-4 border-b border-white/5 bg-[#0a0a10]/80 backdrop-blur-xl flex-shrink-0 z-30">
          <button
            className="md:hidden text-muted-foreground hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search questions, topics..."
              data-testid="input-search"
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification */}
            <button
              data-testid="button-notifications"
              className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
            </button>

            {/* Avatar */}
            <button
              data-testid="button-user-avatar"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
            >
              AK
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a10]">
          {children}
        </main>
      </div>
    </div>
  );
}
