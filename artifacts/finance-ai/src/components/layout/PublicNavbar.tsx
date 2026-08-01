import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function PublicNavbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinanceAI</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/#features"><span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Features</span></Link>
          <Link href="/#testimonials"><span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Testimonials</span></Link>
          <Link href="/#pricing"><span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Pricing</span></Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
