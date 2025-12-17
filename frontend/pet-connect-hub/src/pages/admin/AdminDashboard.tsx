import { useEffect, useState } from 'react';
import { Users, ListPlus, Globe, Clock, Eye, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { statsApi } from '@/services/api';
import { AdminStats, SiteStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    statsApi.getAdminStats().then(res => res.success && setStats(res.data));
    statsApi.getSiteStats().then(res => res.success && setSiteStats(res.data));
  }, []);

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
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      
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
