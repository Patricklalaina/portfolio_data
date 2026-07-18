import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Messages from './pages/messages';
import ProfileSection from './pages/sections/profile';
import ExperienceSection from './pages/sections/experience';
import CertificationsSection from './pages/sections/certifications';
import SkillsSection from './pages/sections/skills';
import ProjectsSection from './pages/sections/projects';
import EducationSection from './pages/sections/education';
import ResumePage from './pages/resume';
import AdminLayout from './components/layout/admin-layout';
import { ThemeProvider } from './contexts/theme-context';

setAuthTokenGetter(() => localStorage.getItem('admin_token'));

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/login';
      }
    }
  })
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    setLocation('/login');
    return null;
  }
  
  return (
    <AdminLayout>
      <Component {...rest} />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/messages"><ProtectedRoute component={Messages} /></Route>
      <Route path="/sections/profile"><ProtectedRoute component={ProfileSection} /></Route>
      <Route path="/sections/experience"><ProtectedRoute component={ExperienceSection} /></Route>
      <Route path="/sections/certifications"><ProtectedRoute component={CertificationsSection} /></Route>
      <Route path="/sections/skills"><ProtectedRoute component={SkillsSection} /></Route>
      <Route path="/sections/projects"><ProtectedRoute component={ProjectsSection} /></Route>
      <Route path="/sections/education"><ProtectedRoute component={EducationSection} /></Route>
      <Route path="/resume"><ProtectedRoute component={ResumePage} /></Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
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
