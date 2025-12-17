import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Calendar, Star, ChevronRight, Share2, Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageGallery } from '@/components/common/ImageGallery';
import { ListingCard } from '@/components/common/ListingCard';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { listingsApi, reportsApi, messagesApi } from '@/services/api';
import { Listing } from '@/types';
import { formatPrice, formatAge, formatRelativeTime, capitalize, getInitials, getSpeciesColor, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await listingsApi.getBySlug(slug);
        if (response.success) {
          setListing(response.data);

          // Record view (non-blocking)
          listingsApi.recordView(response.data.id);

          // Fetch similar listings
          const similarResponse = await listingsApi.getAll(
            { species: [response.data.species] },
            'newest',
            1,
            4
          );
          if (similarResponse.success) {
            setSimilarListings(
              similarResponse.data.filter(l => l.id !== response.data.id).slice(0, 3)
            );
          }
        } else {
          setError(response.message || 'Listing not found');
        }
      } catch {
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [slug]);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorited
        ? 'This listing has been removed from your favorites.'
        : 'This listing has been added to your favorites.',
    });
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to contact the seller.',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!listing) return;

    // Check if user is trying to contact themselves
    if (user?.id === listing.sellerId) {
      toast({
        title: 'Cannot Contact',
        description: 'You cannot send a message to yourself.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await messagesApi.startConversation(listing.sellerId, listing.id);
      if (response.success) {
        // Navigate to the conversation
        navigate(`/dashboard/messages/${response.data.id}`);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to start conversation.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to contact seller. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'The listing URL has been copied to your clipboard.',
      });
    }
  };

  const handleReport = async () => {
    if (!listing || !reportReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the report.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      const response = await reportsApi.create(listing.id, reportReason.trim());
      if (response.success) {
        toast({
          title: 'Report Submitted',
          description: 'Thank you for your report. Our team will review it shortly.',
        });
        setReportDialogOpen(false);
        setReportReason('');
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit report.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (error || !listing) {
    return (
      <div className="container-custom py-12">
        <ErrorState
          title="Listing not found"
          message={error || "The listing you're looking for doesn't exist or has been removed."}
        />
      </div>
    );
  }

  const speciesColorClass = getSpeciesColor(listing.species);
  const availabilityInfo = {
    available: { label: 'Available', className: 'bg-success text-success-foreground' },
    reserved: { label: 'Reserved', className: 'bg-warning text-warning-foreground' },
    sold: { label: 'Sold', className: 'bg-muted text-muted-foreground' },
    adopted: { label: 'Adopted', className: 'bg-info text-info-foreground' },
  }[listing.availability];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/browse" className="hover:text-foreground transition-colors">Browse</Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/browse?species=${listing.species}`}
              className="hover:text-foreground transition-colors"
            >
              {capitalize(listing.species)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Back button - mobile */}
        <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 lg:hidden">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <ImageGallery images={listing.images} title={listing.title} />
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn(speciesColorClass, 'text-primary-foreground')}>
                        {capitalize(listing.species)}
                      </Badge>
                      <Badge className={availabilityInfo.className}>
                        {availabilityInfo.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl lg:text-3xl">{listing.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.city}, {listing.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatRelativeTime(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Breed</div>
                    <div className="font-semibold">{listing.breed}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Age</div>
                    <div className="font-semibold">{formatAge(listing.age)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Gender</div>
                    <div className="font-semibold">{capitalize(listing.gender)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Views</div>
                    <div className="font-semibold">{listing.views}</div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button onClick={handleContact} size="lg" className="w-full">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>
                <Button
                  onClick={handleFavorite}
                  variant="outline"
                  size="lg"
                  className={cn('w-full', isFavorited && 'text-destructive border-destructive/50')}
                >
                  <Heart className={cn('h-5 w-5 mr-2', isFavorited && 'fill-current')} />
                  {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleShare} variant="ghost" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Listing</DialogTitle>
                        <DialogDescription>
                          Please describe why you're reporting this listing. Our team will review your report.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Describe the issue with this listing..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReportDialogOpen(false);
                            setReportReason('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReport}
                          disabled={isSubmittingReport || !reportReason.trim()}
                        >
                          {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Seller info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.sellerName}`} />
                    <AvatarFallback>{getInitials(listing.sellerName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{listing.sellerName}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{listing.sellerRating.toFixed(1)} rating</span>
                    </div>
                  </div>
                </div>
                <Link to={`/profile/${listing.sellerId}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Safety tips */}
            <Card className="bg-accent/50 border-accent">
              <CardContent className="p-6">
                <h4 className="font-semibold text-accent-foreground mb-3">Safety Tips</h4>
                <ul className="text-sm text-accent-foreground/80 space-y-2">
                  <li>• Meet in a public place</li>
                  <li>• Never send money before meeting</li>
                  <li>• Check health certificates</li>
                  <li>• Trust your instincts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar listings */}
        {similarListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Similar Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
