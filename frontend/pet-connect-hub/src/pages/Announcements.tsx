import { useEffect, useState } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { announcementsApi } from '@/services/api';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/services/httpClient';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

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

  const openAnnouncement = async (item: Announcement) => {
    // open immediately with current data
    setSelected(item);
    setOpen(true);

    // optional: load full latest details from backend
    setIsDetailsLoading(true);
    try {
      const res = await announcementsApi.getById(item.id);
      if (res.success) setSelected(res.data);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setSelected(null);
    setIsDetailsLoading(false);
  };

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
          <p className="text-muted-foreground">
            Stay updated with the latest from PetMarket
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {announcements.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openAnnouncement(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openAnnouncement(item);
              }}
            >
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
                  <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.publishDate)}
                  </div>
                </div>
              </CardHeader>

              {/* If you want the list to show only a short preview instead of full content: */}
              <CardContent className="pt-6">
                <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popup / Modal */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) closeDialog();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selected?.title ?? 'Announcement'}
            </DialogTitle>

            {selected?.publishDate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(selected.publishDate)}
              </div>
            )}
          </DialogHeader>

          {isDetailsLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          {selected?.imageUrl && (
            <div className="w-full rounded-md bg-black/5 overflow-hidden">
              <img
                src={getImageUrl(selected.imageUrl)}
                alt={selected.title}
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
          )}

          {selected?.content && (
            <div className="text-sm leading-7 whitespace-pre-wrap">
              {selected.content}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
