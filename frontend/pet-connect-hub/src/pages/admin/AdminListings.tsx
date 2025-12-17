import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listingsApi } from '@/services/api';
import { Listing } from '@/types';
import { formatPrice, capitalize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminListings() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => { listingsApi.getAll({}, 'newest', 1, 50, { useAdminApi: true }).then(res => res.success && setListings(res.data)); }, []);

  const handleApprove = async (id: string) => { await listingsApi.approve(id); setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l)); toast({ title: 'Listing approved' }); };
  const handleReject = async (id: string) => { await listingsApi.reject(id, 'Rejected by admin'); setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l)); toast({ title: 'Listing rejected' }); };
  const handleDelete = async (id: string) => { await listingsApi.delete(id); setListings(prev => prev.filter(l => l.id !== id)); toast({ title: 'Listing deleted' }); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Listings Management</h2>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Listing</TableHead><TableHead>Status</TableHead><TableHead>Price</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {listings.map(listing => (
              <TableRow key={listing.id}>
                <TableCell><div className="font-medium">{listing.title}</div><div className="text-sm text-muted-foreground">{capitalize(listing.species)} • {listing.breed}</div></TableCell>
                <TableCell><Badge variant={listing.status === 'approved' ? 'default' : listing.status === 'pending' ? 'secondary' : 'destructive'}>{capitalize(listing.status)}</Badge></TableCell>
                <TableCell>{formatPrice(listing.price)}</TableCell>
                <TableCell className="space-x-2">
                  {listing.status === 'pending' && <><Button size="sm" onClick={() => handleApprove(listing.id)}>Approve</Button><Button size="sm" variant="outline" onClick={() => handleReject(listing.id)}>Reject</Button></>}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(listing.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
