import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Target, CreditCard, 
  BrainCircuit, TrendingUp, Download, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChartData, mockExpenseCategories, mockTransactions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
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
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Andrew. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Download className="size-4" /> Export
          </Button>
          <Button className="gap-2 shadow-sm">
            <BrainCircuit className="size-4" /> AI Analysis
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                  <p className="text-3xl font-bold tracking-tight font-mono">$24,500.00</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Wallet className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-medium">
                  <ArrowUpRight className="mr-1 size-3" /> 2.5%
                </Badge>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                  <p className="text-3xl font-bold tracking-tight font-mono">$5,200.00</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <TrendingUp className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none font-medium">
                  <ArrowUpRight className="mr-1 size-3" /> 1.2%
                </Badge>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <p className="text-3xl font-bold tracking-tight font-mono">$3,100.50</p>
                </div>
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                  <CreditCard className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none font-medium">
                  <ArrowDownRight className="mr-1 size-3" /> -4.1%
                </Badge>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-none relative overflow-hidden text-card-foreground shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium opacity-80">Financial Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold tracking-tight">82</p>
                    <p className="text-sm font-medium opacity-60 pb-1">/ 100</p>
                  </div>
                </div>
                <div className="p-2 bg-background/50 backdrop-blur rounded-lg shadow-sm">
                  <Target className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium">
                <CheckCircle2 className="size-4 mr-2 text-primary" />
                <span>On track for year-end goals</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Where your money went this month</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockExpenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {mockExpenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`$${value}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-6 space-y-3">
                {mockExpenseCategories.map((category, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium text-muted-foreground">{category.name}</span>
                    </div>
                    <span className="font-mono font-medium">${category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-5">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/transactions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'income' ? <TrendingUp className="size-4" /> : <CreditCard className="size-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category} • {tx.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-medium ${tx.type === 'income' ? 'text-primary' : ''}`}>
                        {tx.type === 'income' ? '+' : ''}{tx.amount > 0 ? tx.amount : -tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="size-5 text-primary" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
              <CardDescription>Generated specifically for your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card border rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                <h4 className="font-semibold text-sm mb-1">Unusual Spending Detected</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your "Entertainment" spending is 40% higher than your 6-month average. Consider reviewing your recent purchases to stay on track.
                </p>
              </div>
              
              <div className="bg-card border rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <h4 className="font-semibold text-sm mb-1">Savings Opportunity</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You have $4,200 sitting in checking. Moving $3,000 to your high-yield savings account could earn you ~$12.50 this month.
                </p>
              </div>

              <Button className="w-full mt-4" asChild>
                <Link href="/advisor">Chat with Advisor</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
