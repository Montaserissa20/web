import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { announcementsApi } from '@/services/api';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnnouncements() {
  const { toast } = useToast();

  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const isEditing = !!editing;

  // ─── Load announcements once ──────────────────────────────────────
  useEffect(() => {
    announcementsApi.getAll().then((res) => res.success && setItems(res.data));
  }, []);

  // Reset form helper
  const resetForm = () => {
    setForm({ title: '', content: '' });
    setEditing(null);
  };

  // Open dialog for "New"
  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  // Open dialog for "Edit"
  const openEditDialog = (item: Announcement) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
    });
    setOpen(true);
  };

  // ─── Create or update ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Validation error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing) {
        // UPDATE
        const res = await announcementsApi.update(editing.id, {
          title: form.title,
          content: form.content,
        });

        if (res.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === editing.id ? res.data : i)),
          );
          toast({ title: 'Announcement updated' });
        } else {
          toast({
            title: 'Error',
            description: res.message || 'Failed to update announcement',
            variant: 'destructive',
          });
        }
      } else {
        // CREATE
        const res = await announcementsApi.create({
          ...form,
          isVisible: true,
          createdBy: 'Admin',
        });

        if (res.success) {
          setItems((prev) => [res.data, ...prev]);
          toast({ title: 'Announcement created' });
        } else {
          toast({
            title: 'Error',
            description: res.message || 'Failed to create announcement',
            variant: 'destructive',
          });
        }
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error('save announcement error:', err);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    const res = await announcementsApi.delete(id);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: 'Deleted' });
    } else {
      toast({
        title: 'Error',
        description: res.message || 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Announcements</h2>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Announcement' : 'Create Announcement'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={4}
              />
              <Button onClick={handleSave} className="w-full">
                {isEditing ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.publishDate)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* New EDIT icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* Existing DELETE icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
