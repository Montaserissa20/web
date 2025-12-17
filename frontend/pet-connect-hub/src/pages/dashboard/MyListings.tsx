import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { listingsApi } from '@/services/api';
import { Listing } from '@/types';
import { formatPrice, formatRelativeTime, capitalize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MyListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;

      try {
        const response = await listingsApi.getByUser(user.id);
        if (response.success) {
          setListings(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    const response = await listingsApi.delete(id);
    if (response.success) {
      setListings(prev => prev.filter(l => l.id !== id));
      toast({
        title: 'Listing deleted',
        description: 'Your listing has been deleted successfully.',
      });
    }
  };

  const getStatusBadge = (listing: Listing) => {
    const variants = {
      pending: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Pending' },
      approved: { className: 'bg-success/10 text-success border-success/30', label: 'Approved' },
      rejected: { className: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Rejected' },
    };
    const variant = variants[listing.status];

    // Show rejection reason with tooltip if rejected
    if (listing.status === 'rejected' && listing.rejectionReason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <Badge variant="outline" className={variant.className}>
                  {variant.label}
                </Badge>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Rejection Reason:</p>
              <p className="text-sm">{listing.rejectionReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Listings</h2>
          <p className="text-muted-foreground">{listings.length} total listings</p>
        </div>
        <Link to="/dashboard/listings/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              title="No listings yet"
              description="Create your first listing to start selling or finding homes for your pets."
              action={{
                label: 'Create Listing',
                onClick: () => (window.location.href = '/dashboard/listings/create'),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map(listing => {
                  // ✅ prevent crash when images is undefined or empty
                  const coverImage =
                    (listing.images && listing.images[0]) ||
                    '/placeholder-pet.jpg'; // put any placeholder path you like

                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={coverImage}
                            alt={listing.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {listing.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {capitalize(listing.species)} • {listing.breed}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing)}</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(listing.price)}
                      </TableCell>
                      <TableCell>{listing.views}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(listing.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/animals/${listing.species}/${listing.slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/listings/edit/${listing.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(listing.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
