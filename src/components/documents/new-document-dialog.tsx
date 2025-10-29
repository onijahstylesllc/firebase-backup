
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface NewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialContent?: string;
}

export function NewDocumentDialog({ open, onOpenChange, initialName, initialContent }: NewDocumentDialogProps) {
  const [docName, setDocName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setDocName(initialName || '');
    }
  }, [open, initialName]);

  const handleCreateDocument = async () => {
    if (!docName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Document name is required',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to create a document.',
        });
        return;
    }

    let sanitizedName: string;
    try {
      const { sanitizeTextInput, sanitizeFilename } = await import('@/lib/security/sanitize');
      const cleanName = sanitizeTextInput(docName, 255);
      sanitizedName = sanitizeFilename(cleanName.endsWith('.pdf') ? cleanName : `${cleanName}.pdf`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid document name',
        description: 'Document name contains invalid characters',
      });
      return;
    }

    const newDoc = {
        filename: sanitizedName,
        user_id: user.id,
        uploadDate: new Date().toISOString(),
        fileSize: 0,
        contentType: 'application/pdf',
        storageLocation: '',
        downloadURL: '',
        isBlank: !initialContent,
        content: initialContent || '',
    };
    
    const { error } = await supabase.from('documents').insert([newDoc]);

    if (error) {
        toast({
            variant: 'destructive',
            title: 'Error creating document',
            description: error.message,
        });
        return;
    }

    toast({
        title: 'Document created',
        description: `"${newDoc.filename}" has been added to your documents.`,
    });

    setDocName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialName ? 'Create from Template' : 'Create New Document'}</DialogTitle>
          <DialogDescription>
            Give your new document a name. You can change it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Marketing Proposal"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDocument()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateDocument}>Create Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
