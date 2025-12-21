import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { ListingCard } from '@/components/common/ListingCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingCard } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesApi } from '@/services/api';
import { Listing } from '@/types';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const response = await favoritesApi.getByUser(user.id);
        if (response.success) {
          setFavorites(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (id: string) => {
    // Call API to remove from favorites
    const response = await favoritesApi.remove(user?.id || '', id);
    if (response.success) {
      setFavorites(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">My Favorites</h2>
        <p className="text-muted-foreground">{favorites.length} saved listings</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No favorites yet"
          description="Start browsing and save listings you're interested in."
          action={{
            label: 'Browse Animals',
            onClick: () => window.location.href = '/browse',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorited={true}
              onFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
