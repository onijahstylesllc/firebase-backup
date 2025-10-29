
'use client';

import React, { useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeFilename } from '@/lib/security/sanitize';
import { validateImageFile } from '@/lib/security/validation';
import { toast } from '@/hooks/use-toast';

export interface ImageUploadStatus {
  id: string;
  file: File;
  status: 'uploading' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
}

interface ImageUploaderProps {
  children: ReactNode;
  documentId: string;
  onNewUploads: (uploads: ImageUploadStatus[]) => void;
  onUploadProgress: (id: string, progress: number) => void;
  onUploadCompleted: (id: string, url: string) => void;
  acceptedFileTypes?: string[];
}

export function ImageUploader({
  children,
  documentId,
  onNewUploads,
  onUploadProgress,
  onUploadCompleted,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif'],
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (upload: ImageUploadStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const sanitizedFilename = sanitizeFilename(upload.file.name);
      const sanitizedDocId = documentId.replace(/[^a-zA-Z0-9-_]/g, '');
      const storagePath = `document-images/${sanitizedDocId}/${upload.id}-${sanitizedFilename}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(storagePath, upload.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath);
      onUploadCompleted(upload.id, publicUrl);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Image upload failed',
        description: error.message || 'Failed to upload image',
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const { data: { user } } = await supabase.auth.getUser();
    if (!files || !user) return;
    
    const validUploads: ImageUploadStatus[] = [];
    
    for (const file of Array.from(files)) {
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: validation.error || 'Invalid image file',
        });
        continue;
      }
      
      const id = uuidv4();
      validUploads.push({
        id,
        file,
        status: 'uploading',
        progress: 0,
      });
    }

    if (validUploads.length > 0) {
      onNewUploads(validUploads);
      validUploads.forEach(uploadFile);
    }
    
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes.join(',')}
      />
      <div onClick={triggerFileSelect} className="cursor-pointer">
        {children}
      </div>
    </>
  );
}
