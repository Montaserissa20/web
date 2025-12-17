import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ListPlus, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/common/ListingCard';
import { LoadingCard } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, listingsApi } from '@/services/api';
import { DashboardStats, Listing } from '@/types';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [statsRes, listingsRes] = await Promise.all([
          statsApi.getUserDashboardStats(user.id),
          listingsApi.getByUser(user.id),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (listingsRes.success) setRecentListings(listingsRes.data.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const statCards = [
    {
      title: 'Total Listings',
      value: stats?.totalListings || 0,
      icon: ListPlus,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Listings',
      value: stats?.activeListings || 0,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Total Favorites',
      value: stats?.totalFavorites || 0,
      icon: Heart,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Listings</CardTitle>
          <Link to="/dashboard/listings">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : recentListings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
              <Link to="/dashboard/listings/create">
                <Button>Create Your First Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showFavorite={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/dashboard/listings/create">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <ListPlus className="h-6 w-6" />
                <span>Create Listing</span>
              </Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Eye className="h-6 w-6" />
                <span>Browse Animals</span>
              </Button>
            </Link>
            <Link to="/dashboard/settings">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Heart className="h-6 w-6" />
                <span>Edit Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
