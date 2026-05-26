import { Link, useLocation } from "react-router-dom";
import { Film, List, MessageCircle, Search, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Buscar", icon: Search },
  { to: "/watchlist", label: "Watchlist", icon: Film },
  { to: "/lists", label: "Listas", icon: List },
  { to: "/chat", label: "Chat IA", icon: MessageCircle },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
            <Clapperboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline-block">
            MovieTracker
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
