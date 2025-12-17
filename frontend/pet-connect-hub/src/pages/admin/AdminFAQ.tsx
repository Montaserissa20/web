import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { faqApi } from '@/services/api';
import { FAQItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminFAQ() {
  const { toast } = useToast();
  const [items, setItems] = useState<FAQItem[]>([]);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' });
  const [open, setOpen] = useState(false);

  useEffect(() => { faqApi.getAll().then(res => res.success && setItems(res.data)); }, []);

  const handleCreate = async () => {
    const res = await faqApi.create({ ...form, isVisible: true });
    if (res.success) { setItems([...items, res.data]); setForm({ question: '', answer: '', category: 'General' }); setOpen(false); toast({ title: 'FAQ created' }); }
  };

  const handleDelete = async (id: string) => { await faqApi.delete(id); setItems(items.filter(i => i.id !== id)); toast({ title: 'Deleted' }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">FAQ Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New FAQ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create FAQ</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
              <Textarea placeholder="Answer" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} />
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div><p className="text-xs text-muted-foreground">{item.category}</p><h3 className="font-semibold">{item.question}</h3><p className="text-sm text-muted-foreground mt-1">{item.answer}</p></div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
