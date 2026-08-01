import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { 
  ArrowRight, 
  ShieldCheck, 
  BrainCircuit, 
  LineChart, 
  PieChart, 
  Zap,
  Target,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 px-4 md:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
          
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
              >
                <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse" />
                FinanceAI 2.0 is now available
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl"
              >
                Wall Street logic. <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">Everyday wealth.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl"
              >
                Your personal AI Chief Financial Officer. Track spending, optimize investments, and build wealth with institutional-grade insights tailored to your life.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-lg shadow-primary/20 group">
                    Start Building Wealth
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    View Live Demo
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Dashboard Preview Mock */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-16 md:mt-24 relative rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl p-2 md:p-4"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-xl pointer-events-none" />
              <div className="rounded-lg border bg-card overflow-hidden">
                {/* Fake header */}
                <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-destructive/80" />
                    <div className="size-3 rounded-full bg-yellow-500/80" />
                    <div className="size-3 rounded-full bg-primary/80" />
                  </div>
                </div>
                {/* Fake App Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
                  <div className="hidden md:block border-r bg-muted/10 p-4 space-y-4">
                    <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                  <div className="col-span-3 p-6 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-8 bg-primary/20 rounded w-48" />
                      </div>
                      <div className="h-10 bg-primary rounded w-32" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-muted/50 rounded-lg border" />
                      <div className="h-24 bg-muted/50 rounded-lg border" />
                      <div className="h-24 bg-muted/50 rounded-lg border" />
                    </div>
                    <div className="h-48 bg-muted/30 rounded-lg border flex items-end p-4 gap-2">
                       <div className="w-1/6 bg-primary/40 h-1/3 rounded-t" />
                       <div className="w-1/6 bg-primary/60 h-1/2 rounded-t" />
                       <div className="w-1/6 bg-primary/80 h-2/3 rounded-t" />
                       <div className="w-1/6 bg-primary/50 h-1/2 rounded-t" />
                       <div className="w-1/6 bg-primary/90 h-full rounded-t" />
                       <div className="w-1/6 bg-primary/70 h-3/4 rounded-t" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-muted/30 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligence meets intuition.</h2>
              <p className="text-muted-foreground text-lg">
                We've combined advanced machine learning with behavioral finance to give you insights you can actually act on.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: "AI-Powered Insights",
                  desc: "Our engine analyzes your spending patterns to identify savings opportunities you didn't know existed."
                },
                {
                  icon: LineChart,
                  title: "Proactive Investment",
                  desc: "Get institutional-grade portfolio analysis tailored to your personal risk tolerance."
                },
                {
                  icon: ShieldCheck,
                  title: "Bank-Grade Security",
                  desc: "Your data is encrypted with AES-256 and never sold to third parties. Complete privacy."
                },
                {
                  icon: PieChart,
                  title: "Automated Budgeting",
                  desc: "Say goodbye to spreadsheets. FinanceAI automatically categorizes and tracks every cent."
                },
                {
                  icon: Target,
                  title: "Goal Tracking",
                  desc: "Set targets for a house, car, or retirement. We'll build the roadmap to get you there."
                },
                {
                  icon: Zap,
                  title: "Real-time Alerts",
                  desc: "Get notified before you overspend, when bills are due, or when unusual activity occurs."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
             <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing.</h2>
              <p className="text-muted-foreground text-lg">
                Choose the plan that fits your financial journey.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="border rounded-3xl p-8 bg-card flex flex-col">
                <h3 className="text-xl font-medium mb-2">Basic</h3>
                <div className="mb-6"><span className="text-4xl font-bold">$0</span><span className="text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-6">Essential tools for tracking your money.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Connect up to 2 bank accounts', 'Basic budget tracking', 'Standard categorizations', 'Monthly summary report'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle2 className="size-4 text-primary mr-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-primary rounded-3xl p-8 bg-card flex flex-col relative shadow-xl shadow-primary/10">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-xl font-medium mb-2 text-primary">Pro</h3>
                <div className="mb-6"><span className="text-4xl font-bold">$12</span><span className="text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-6">Advanced AI insights for serious wealth building.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Unlimited bank connections', 'Full AI Advisor access', 'Custom budget rules', 'Investment tracking & insights', 'Priority support'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle2 className="size-4 text-primary mr-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Start Free Trial</Button>
              </div>

              {/* Enterprise */}
              <div className="border rounded-3xl p-8 bg-card flex flex-col">
                <h3 className="text-xl font-medium mb-2">Wealth</h3>
                <div className="mb-6"><span className="text-4xl font-bold">$49</span><span className="text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-6">For complex portfolios and high-net-worth individuals.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Everything in Pro', 'CPA & Tax Advisor access', 'Real estate valuation', 'Crypto & alternative assets', 'Quarterly 1-on-1 review'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle2 className="size-4 text-primary mr-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <span className="text-xl font-bold">FinanceAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FinanceAI Inc. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
