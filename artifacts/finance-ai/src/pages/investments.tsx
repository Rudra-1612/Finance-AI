import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShieldAlert, Zap, Clock, Banknote, Landmark, Wallet, Plus } from "lucide-react";

const investmentOptions = [
  {
    title: "S&P 500 ETFs",
    category: "Equity",
    risk: "Moderate",
    horizon: "5-10 Years",
    liquidity: "High",
    return: "8-10% avg",
    description: "Broad market exposure tracking the 500 largest US companies. A staple for long-term wealth building with built-in diversification.",
    icon: TrendingUp
  },
  {
    title: "US Treasury Bonds",
    category: "Fixed Income",
    risk: "Low",
    horizon: "1-30 Years",
    liquidity: "High",
    return: "4-5% avg",
    description: "Government-backed debt securities. Historically safe haven assets that provide regular interest payments and preserve capital.",
    icon: Landmark
  },
  {
    title: "Dividend Aristocrats",
    category: "Equity",
    risk: "Moderate",
    horizon: "5+ Years",
    liquidity: "High",
    return: "7-9% avg",
    description: "Companies that have consecutively increased their dividend payouts for at least 25 years. Strong cash flow generators.",
    icon: Banknote
  },
  {
    title: "Physical Gold",
    category: "Commodities",
    risk: "Low-Moderate",
    horizon: "10+ Years",
    liquidity: "Moderate",
    return: "Variable",
    description: "Traditional inflation hedge and store of value. Often performs inversely to the stock market during times of economic stress.",
    icon: ShieldAlert
  },
  {
    title: "High-Yield Fixed Deposits",
    category: "Cash Equivalent",
    risk: "Very Low",
    horizon: "3 Months - 5 Years",
    liquidity: "Low",
    return: "4-5.5% avg",
    description: "Bank deposits offering guaranteed returns over a fixed period. Your principal is insured up to FDIC limits.",
    icon: Wallet
  },
  {
    title: "Tech Growth Mutual Funds",
    category: "Equity",
    risk: "High",
    horizon: "7+ Years",
    liquidity: "High",
    return: "10-15% avg",
    description: "Actively managed funds focusing on innovative technology companies. Higher volatility but potential for outsized returns.",
    icon: Zap
  }
];

export default function Investments() {
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
          <h1 className="text-3xl font-bold tracking-tight">Investment Education</h1>
          <p className="text-muted-foreground mt-1">Explore assets to build your portfolio.</p>
        </div>
        <Button className="gap-2 shadow-md shadow-primary/20">
          <Plus className="size-4" /> Add Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investmentOptions.map((opt, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    <opt.icon className="size-5" />
                  </div>
                  <Badge variant="outline" className="font-normal">{opt.category}</Badge>
                </div>
                <CardTitle className="text-xl">{opt.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 mt-1.5">{opt.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">Risk Level</p>
                    <p className="font-medium flex items-center">
                      <span className={`size-2 rounded-full mr-1.5 ${
                        opt.risk.includes('Low') ? 'bg-primary' : 
                        opt.risk.includes('Moderate') ? 'bg-yellow-500' : 'bg-destructive'
                      }`} />
                      {opt.risk}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs flex items-center"><Clock className="size-3 mr-1"/> Horizon</p>
                    <p className="font-medium">{opt.horizon}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">Liquidity</p>
                    <p className="font-medium">{opt.liquidity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">Est. Return</p>
                    <p className="font-medium text-primary">{opt.return}</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
