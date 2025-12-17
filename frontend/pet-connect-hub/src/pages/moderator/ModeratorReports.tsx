import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportsApi } from '@/services/api';
import { Report } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ModeratorReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => { reportsApi.getPending().then(res => res.success && setReports(res.data)); }, []);

  const handleResolve = async (id: string) => { await reportsApi.resolve(id); setReports(prev => prev.filter(r => r.id !== id)); toast({ title: 'Report resolved' }); };
  const handleDismiss = async (id: string) => { await reportsApi.dismiss(id); setReports(prev => prev.filter(r => r.id !== id)); toast({ title: 'Report dismissed' }); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reported Listings ({reports.length})</h2>
      {reports.length === 0 ? <p className="text-muted-foreground">No pending reports.</p> : (
        <div className="space-y-4">
          {reports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{report.listingTitle}</h3>
                    <p className="text-sm text-muted-foreground">Reported by {report.reporterName} • {formatRelativeTime(report.createdAt)}</p>
                    <p className="text-sm mt-2">{report.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleResolve(report.id)}>Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDismiss(report.id)}>Dismiss</Button>
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
