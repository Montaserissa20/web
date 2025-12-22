import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { getImageUrl } from '@/services/httpClient';

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const isEditing = !!editing;

  // ─── Load announcements once ──────────────────────────────────────
  useEffect(() => {
    announcementsApi.getAll().then((res) => res.success && setItems(res.data));
  }, []);

  // Reset form helper
  const resetForm = () => {
    setForm({ title: '', content: '', imageUrl: '' });
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
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
      imageUrl: item.imageUrl || '',
    });
    setImagePreview(item.imageUrl ? getImageUrl(item.imageUrl) : null);
    setOpen(true);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    setIsUploading(true);

    try {
      // Upload image if there's a new file
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadRes = await announcementsApi.uploadImage(imageFile);
        if (uploadRes.success && uploadRes.data) {
          imageUrl = uploadRes.data.imageUrl;
        } else {
          toast({
            title: 'Error',
            description: 'Failed to upload image',
            variant: 'destructive',
          });
          setIsUploading(false);
          return;
        }
      }

      if (isEditing) {
        // UPDATE
        const res = await announcementsApi.update(editing.id, {
          title: form.title,
          content: form.content,
          imageUrl,
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
          title: form.title,
          content: form.content,
          imageUrl,
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
    } finally {
      setIsUploading(false);
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

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Image (optional)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              <Button onClick={handleSave} className="w-full" disabled={isUploading}>
                {isUploading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex gap-4 items-start flex-1">
                {item.imageUrl && (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.publishDate)}
                  </p>
                </div>
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
