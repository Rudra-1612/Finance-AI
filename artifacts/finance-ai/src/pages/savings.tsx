import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2 } from "lucide-react";
import { mockSavingsGoals } from "@/lib/mock-data";

export default function Savings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress towards financial freedom.</p>
        </div>
        <Button className="gap-2 shadow-md shadow-primary/20">
          <Plus className="size-4" /> Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSavingsGoals.map((goal, i) => {
          const percent = (goal.current / goal.target) * 100;
          const isComplete = percent >= 100;
          
          return (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary mb-2 group-hover:scale-110 transition-transform">
                      {isComplete ? <CheckCircle2 className="size-6" /> : <Target className="size-6" />}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      By {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <CardTitle>{goal.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-mono font-bold text-xl">${goal.current.toLocaleString()}</span>
                        <span className="font-mono text-muted-foreground self-end">of ${goal.target.toLocaleString()}</span>
                      </div>
                      <Progress value={percent} className="h-3" />
                    </div>
                    
                    <div className="pt-4 border-t flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-primary font-bold">{percent.toFixed(1)}%</span>
                        <span className="text-muted-foreground ml-1">funded</span>
                      </div>
                      <Button variant="outline" size="sm">Deposit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
