
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';

interface SummaryDialogProps {
  doc: any | null;
  onOpenChange: (open: boolean) => void;
}

export function SummaryDialog({ doc, onOpenChange }: SummaryDialogProps) {
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (doc) {
      setSummary(doc.archiveSummary || '');
    }
  }, [doc]);

  const handleSaveChanges = async () => {
    if (!doc) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to save changes.',
        });
        return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ archiveSummary: summary })
        .match({ id: doc.id, user_id: user.id });

      if (error) throw error;

      toast({
        title: 'Summary Updated',
        description: 'Your changes to the summary have been saved.',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update summary:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save the summary. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!doc) return;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.filename}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const isOpen = !!doc;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>AI-Generated Summary</DialogTitle>
          <DialogDescription>
            Review, edit, and download the summary for "{doc?.filename}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="summary-text">Summary</Label>
            <Textarea
              id="summary-text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[250px]"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter className='sm:justify-between'>
            <Button variant="outline" onClick={handleDownload} disabled={!summary}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
