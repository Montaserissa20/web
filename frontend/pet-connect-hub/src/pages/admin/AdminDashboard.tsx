import { useEffect, useState, useCallback } from 'react';
import { Users, ListPlus, Globe, Clock, Eye, UserCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { statsApi } from '@/services/api';
import { AdminStats, SiteStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    const [adminRes, siteRes] = await Promise.all([
      statsApi.getAdminStats(),
      statsApi.getSiteStats(),
    ]);
    if (adminRes.success) setStats(adminRes.data);
    if (siteRes.success) setSiteStats(siteRes.data);
    setLastUpdated(new Date());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const cards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Total Listings', value: stats?.totalListings || 0, icon: ListPlus, color: 'text-info', bg: 'bg-info/10' },
    { title: 'Pending Review', value: stats?.pendingListings || 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Countries', value: stats?.totalCountries || 0, icon: Globe, color: 'text-success', bg: 'bg-success/10' },
  ];

  const visitorCards = [
    { title: 'Total Visitors', value: siteStats?.totalVisitors || 0, icon: Eye, color: 'text-accent-foreground', bg: 'bg-accent' },
    { title: 'Online Now', value: siteStats?.onlineUsers || 0, icon: UserCheck, color: 'text-success', bg: 'bg-success/10', pulse: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`h-6 w-6 ${c.color}`} /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visitor Stats */}
      <h3 className="text-lg font-semibold mt-8">Site Traffic</h3>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {visitorCards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.bg} relative`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                  {c.pulse && <span className="absolute top-1 right-1 h-2 w-2 bg-success rounded-full animate-pulse" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
