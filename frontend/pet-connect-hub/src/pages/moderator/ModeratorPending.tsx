import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listingsApi } from '@/services/api';
import { Listing } from '@/types';
import { formatPrice, capitalize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ModeratorPending() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => { listingsApi.getPending().then(res => res.success && setListings(res.data)); }, []);

  const handleApprove = async (id: string) => { await listingsApi.approve(id); setListings(prev => prev.filter(l => l.id !== id)); toast({ title: 'Listing approved' }); };
  const handleReject = async (id: string) => { await listingsApi.reject(id, rejectReason[id] || 'Rejected'); setListings(prev => prev.filter(l => l.id !== id)); toast({ title: 'Listing rejected' }); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pending Listings ({listings.length})</h2>
      {listings.length === 0 ? <p className="text-muted-foreground">No pending listings to review.</p> : (
        <div className="space-y-4">
          {listings.map(listing => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img src={listing.images[0]} alt="" className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{capitalize(listing.species)} • {listing.breed} • {formatPrice(listing.price)}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleApprove(listing.id)}>Approve</Button>
                      <Input placeholder="Rejection reason" value={rejectReason[listing.id] || ''} onChange={e => setRejectReason({ ...rejectReason, [listing.id]: e.target.value })} className="w-48" />
                      <Button size="sm" variant="destructive" onClick={() => handleReject(listing.id)}>Reject</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
