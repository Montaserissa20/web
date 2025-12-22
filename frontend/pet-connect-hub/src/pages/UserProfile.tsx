import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, listingsApi } from '@/services/api';
import { UserProfile as UserProfileType, Listing } from '@/types';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myRating, setMyRating] = useState<number>(0);
  const [myReview, setMyReview] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile
        const profileRes = await usersApi.getPublicProfile(id);
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }

        // Fetch user's listings
        const listingsRes = await listingsApi.getAll(undefined, 'newest', 1, 6, {
          sellerId: id,
        });
        if (listingsRes.success && listingsRes.data) {
          setListings(listingsRes.data);
        }

        // Fetch my rating for this user (if logged in)
        if (isAuthenticated && !isOwnProfile) {
          const ratingRes = await usersApi.getMyRating(id);
          if (ratingRes.success && ratingRes.data) {
            setMyRating(ratingRes.data.rating);
            setMyReview(ratingRes.data.review || '');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, isOwnProfile]);

  const handleSubmitRating = async () => {
    if (!id || myRating === 0) return;

    setIsSubmitting(true);
    try {
      const res = await usersApi.rateUser(id, myRating, myReview || undefined);
      if (res.success) {
        toast({ title: 'Rating submitted', description: 'Thank you for your feedback!' });
        // Refresh profile to get updated rating
        const profileRes = await usersApi.getPublicProfile(id);
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <Link to="/browse">
            <Button>Browse Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback>
                    <UserIcon className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mb-2">{profile.displayName}</h1>
                
                {/* Rating Display */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(profile.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {profile.rating.toFixed(1)} ({profile.ratingCount} reviews)
                  </span>
                </div>

                {/* Location & Join Date */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formatDate(profile.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t w-full">
                  <p className="text-sm text-muted-foreground">
                    {profile.listingsCount} active listing{profile.listingsCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate This User */}
          {isAuthenticated && !isOwnProfile && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Rate This Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMyRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || myRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write a review (optional)"
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
                <Button
                  onClick={handleSubmitRating}
                  disabled={myRating === 0 || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && (
            <Card className="mt-6">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Log in to rate this seller</p>
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Listings & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* User's Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Listings by {profile.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active listings</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/animals/${listing.species}/${listing.slug}`}
                      className="block"
                    >
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={listing.images[0] || '/placeholder.svg'}
                          alt={listing.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-medium truncate">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">${listing.price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({profile.ratingCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.ratings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {profile.ratings.map((rating) => (
                    <div key={rating.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={rating.rater.avatar} alt={rating.rater.name} />
                          <AvatarFallback>{rating.rater.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{rating.rater.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rating.review && (
                            <p className="text-sm text-muted-foreground">{rating.review}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(rating.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

