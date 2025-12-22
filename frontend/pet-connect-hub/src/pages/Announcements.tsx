import { useEffect, useState } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { announcementsApi } from '@/services/api';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/services/httpClient';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementsApi.getPublic();
        if (response.success) setAnnouncements(response.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4">
            <Bell className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            News & Announcements
          </h1>
          <p className="text-muted-foreground">Stay updated with the latest from PetMarket</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {announcements.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.publishDate)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground whitespace-pre-wrap">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
