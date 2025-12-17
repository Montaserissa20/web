import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Flag, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { href: '/moderator', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/moderator/pending', icon: Clock, label: 'Pending Listings' },
  { href: '/moderator/reports', icon: Flag, label: 'Reports' },
];

export default function ModeratorLayout() {
  const location = useLocation();
  const { hasRole, isLoading, logout, user } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!hasRole(['admin', 'moderator'])) return <Navigate to="/login" replace />;

  const isActive = (href: string, exact?: boolean) => exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b border-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Site</Button></Link>
              <h1 className="text-xl font-display font-bold text-foreground">Moderator Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <ThemeToggle />
              <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-card rounded-xl border border-border p-2 lg:sticky lg:top-24">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={cn('flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive(item.href, item.exact) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
                      <item.icon className="h-5 w-5" />{item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className="flex-1 min-w-0"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
