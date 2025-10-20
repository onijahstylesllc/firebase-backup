
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
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface NewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialContent?: string;
}

export function NewDocumentDialog({ open, onOpenChange, initialName, initialContent }: NewDocumentDialogProps) {
  const [docName, setDocName] = useState('');
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    // When the dialog opens, set the document name.
    // If an initialName is provided (from a template), use it.
    // Otherwise, reset it to an empty string for a new blank document.
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

    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not connect to the database. Please try again.',
        });
        return;
    }

    const newDoc = {
        filename: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        owner: user.displayName || user.email,
        uploadDate: serverTimestamp(),
        fileSize: 0,
        contentType: 'application/pdf',
        storageLocation: '',
        downloadURL: '',
        isBlank: !initialContent,
        content: initialContent || '', // Save template content
    };
    
    const collectionRef = collection(firestore, 'users', user.uid, 'documents');
    addDocumentNonBlocking(collectionRef, newDoc);

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
