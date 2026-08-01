import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import LandingPage from '@/pages/landing';
import Login from '@/pages/login';
import Register from '@/pages/register';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/dashboard';
import Transactions from '@/pages/transactions';
import Budgets from '@/pages/budgets';
import Savings from '@/pages/savings';
import Advisor from '@/pages/advisor';

import Expenses from '@/pages/expenses';
import Investments from '@/pages/investments';
import Reports from '@/pages/reports';
import Notifications from '@/pages/notifications';
import Settings from '@/pages/settings';

const queryClient = new QueryClient();

// A wrapper to apply AppLayout to protected routes
const ProtectedRoute = ({ component: Component }: { component: any }) => (
  <AppLayout>
    <Component />
  </AppLayout>
);

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected App Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/transactions"><ProtectedRoute component={Transactions} /></Route>
      <Route path="/expenses"><ProtectedRoute component={Expenses} /></Route>
      <Route path="/budgets"><ProtectedRoute component={Budgets} /></Route>
      <Route path="/savings"><ProtectedRoute component={Savings} /></Route>
      <Route path="/investments"><ProtectedRoute component={Investments} /></Route>
      <Route path="/advisor"><ProtectedRoute component={Advisor} /></Route>
      <Route path="/advisor/:id"><ProtectedRoute component={Advisor} /></Route>
      <Route path="/reports"><ProtectedRoute component={Reports} /></Route>
      <Route path="/notifications"><ProtectedRoute component={Notifications} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
