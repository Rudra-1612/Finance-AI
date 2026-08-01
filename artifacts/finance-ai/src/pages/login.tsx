import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <Link href="/">
        <Button variant="ghost" className="absolute top-6 left-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border rounded-3xl shadow-xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <TrendingUp className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your details to access your dashboard</p>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full h-12" onClick={() => {}}>
            <FcGoogle className="mr-2 size-5" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" className="h-12" required />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <Input id="password" type="password" className="h-12" required />
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">Remember me for 30 days</Label>
            </div>

            <Link href="/dashboard">
              <Button type="button" className="w-full h-12 text-base font-semibold shadow-md shadow-primary/20">
                Sign In
              </Button>
            </Link>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link href="/register">
            <span className="text-primary hover:underline font-medium cursor-pointer">Create one</span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
