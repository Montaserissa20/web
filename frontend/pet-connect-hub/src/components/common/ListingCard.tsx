// src/components/common/ListingCard.tsx
import { Link } from 'react-router-dom';
import { Heart, MapPin, Eye } from 'lucide-react';
import { Listing } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatPrice,
  formatAge,
  truncate,
  capitalize,
  getSpeciesColor,
  cn,
} from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  showFavorite?: boolean;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function ListingCard({
  listing,
  showFavorite = true,
  onFavorite,
  isFavorited = false,
}: ListingCardProps) {
  const speciesColorClass = getSpeciesColor(listing.species);

  const availabilityBadge = {
    available: { label: 'Available', className: 'bg-success text-success-foreground' },
    reserved: { label: 'Reserved', className: 'bg-warning text-warning-foreground' },
    sold: { label: 'Sold', className: 'bg-muted text-muted-foreground' },
    adopted: { label: 'Adopted', className: 'bg-info text-info-foreground' },
  }[listing.availability];

  // 🔹 robust, always-valid image URL
  const coverImage =
    (Array.isArray(listing.images) &&
      listing.images.length > 0 &&
      listing.images[0] &&
      listing.images[0].trim() !== '')
      ? listing.images[0]
      : 'https://via.placeholder.com/600x450?text=No+Image';

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to={`/animals/${listing.species}/${listing.slug}`}>
          <img
            src={coverImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Availability badge */}
        <Badge className={cn('absolute top-3 left-3', availabilityBadge.className)}>
          {availabilityBadge.label}
        </Badge>

        {/* Species badge */}
        <Badge
          className={cn(
            'absolute top-3 right-12',
            speciesColorClass,
            'text-primary-foreground'
          )}
        >
          {capitalize(listing.species)}
        </Badge>

        {/* Favorite button */}
        {showFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              onFavorite?.(listing.id);
            }}
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card',
              isFavorited && 'text-destructive'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
          </Button>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-lg shadow-md">
          <span className="font-bold text-primary text-lg">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/animals/${listing.species}/${listing.slug}`}>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {truncate(listing.description, 80)}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>
              {listing.city}, {listing.country}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>{listing.breed}</span>
            <span>•</span>
            <span>{formatAge(listing.age)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.sellerName}`}
              alt={listing.sellerName}
              className="h-5 w-5 rounded-full"
            />
            <span className="text-xs text-muted-foreground">
              {listing.sellerName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{listing.views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
