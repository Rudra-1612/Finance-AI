import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mockBudgets } from "@/lib/mock-data";
import { Plus, Utensils, ShoppingBag, Home, Car, Film, Heart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const icons = {
  Utensils, ShoppingBag, Home, Car, Film, Heart
};

export default function Budgets() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage your monthly spending limits.</p>
        </div>
        <Button className="gap-2 shadow-md shadow-primary/20">
          <Plus className="size-4" /> Create Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBudgets.map((budget, i) => {
          const percent = (budget.spent / budget.limit) * 100;
          const isWarning = percent > 85;
          const isDanger = percent >= 100;
          const Icon = icons[budget.icon as keyof typeof icons] || Utensils;
          
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className={`h-full transition-shadow hover:shadow-md ${isDanger ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDanger ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                    </div>
                    {isDanger && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="size-3" /> Over
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-end mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="text-2xl font-bold font-mono tracking-tight">${budget.spent}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">Limit</p>
                      <p className="text-sm font-medium font-mono">${budget.limit}</p>
                    </div>
                  </div>
                  <Progress 
                    value={percent} 
                    className={`h-2.5 mt-4 ${isDanger ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-yellow-500' : '[&>div]:bg-primary'}`} 
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {percent.toFixed(0)}% used
                  </p>
                </CardContent>
                <CardFooter className="pt-2 border-t mt-4 border-dashed bg-muted/20">
                  <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-mono font-bold ${isDanger ? 'text-destructive' : 'text-primary'}`}>
                      ${Math.max(0, budget.limit - budget.spent).toFixed(2)}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
