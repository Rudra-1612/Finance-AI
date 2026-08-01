export const mockTransactions = [
  { id: 1, date: "2023-10-24", category: "Income", amount: 5200.00, paymentMethod: "Direct Deposit", description: "Acme Corp Salary", type: "income" },
  { id: 2, date: "2023-10-23", category: "Housing", amount: -1500.00, paymentMethod: "Bank Transfer", description: "Monthly Rent", type: "expense" },
  { id: 3, date: "2023-10-21", category: "Food", amount: -85.50, paymentMethod: "Credit Card", description: "Whole Foods Market", type: "expense" },
  { id: 4, date: "2023-10-20", category: "Transport", amount: -45.00, paymentMethod: "Credit Card", description: "Uber Rides", type: "expense" },
  { id: 5, date: "2023-10-18", category: "Entertainment", amount: -120.00, paymentMethod: "Debit Card", description: "Concert Tickets", type: "expense" },
  { id: 6, date: "2023-10-15", category: "Utilities", amount: -95.20, paymentMethod: "Bank Transfer", description: "Electric Bill", type: "expense" },
  { id: 7, date: "2023-10-10", category: "Shopping", amount: -210.00, paymentMethod: "Credit Card", description: "Apple Store", type: "expense" },
  { id: 8, date: "2023-10-05", category: "Income", amount: 450.00, paymentMethod: "PayPal", description: "Freelance Design", type: "income" },
];

export const mockBudgets = [
  { category: "Food & Dining", spent: 450, limit: 600, icon: "Utensils" },
  { category: "Shopping", spent: 320, limit: 400, icon: "ShoppingBag" },
  { category: "Housing", spent: 1500, limit: 1500, icon: "Home" },
  { category: "Transportation", spent: 180, limit: 250, icon: "Car" },
  { category: "Entertainment", spent: 120, limit: 200, icon: "Film" },
  { category: "Healthcare", spent: 45, limit: 150, icon: "Heart" },
];

export const mockSavingsGoals = [
  { id: 1, name: "Emergency Fund", current: 8500, target: 10000, deadline: "2024-06-01" },
  { id: 2, name: "New Car Downpayment", current: 4200, target: 8000, deadline: "2024-12-01" },
  { id: 3, name: "Summer Vacation", current: 1500, target: 3000, deadline: "2024-07-15" },
];

export const mockChartData = [
  { name: 'Jan', income: 4800, expenses: 3100 },
  { name: 'Feb', income: 5100, expenses: 2900 },
  { name: 'Mar', income: 4900, expenses: 3300 },
  { name: 'Apr', income: 5200, expenses: 3000 },
  { name: 'May', income: 5300, expenses: 3200 },
  { name: 'Jun', income: 5200, expenses: 3100 },
];

export const mockExpenseCategories = [
  { name: 'Housing', value: 1500, color: 'hsl(var(--chart-1))' },
  { name: 'Food', value: 600, color: 'hsl(var(--chart-2))' },
  { name: 'Transport', value: 250, color: 'hsl(var(--chart-3))' },
  { name: 'Shopping', value: 400, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 350, color: 'hsl(var(--chart-5))' },
];
