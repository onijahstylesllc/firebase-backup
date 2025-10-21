
'use client';

import React, { useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const storagePath = `document-images/${documentId}/${upload.id}-${upload.file.name}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, upload.file, {
        cacheControl: '3600',
        upsert: false,
        //TODO: Progress tracking is not directly supported in the same way as Firebase.
        //You might need a different approach for progress bars, e.g., using a separate library or a server-side solution.
      });

    if (error) {
      console.error('Image upload failed:', error);
      // Maybe add an onUploadFailed callback if needed
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath);
    onUploadCompleted(upload.id, publicUrl);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const { data: { user } } = await supabase.auth.getUser();
    if (!files || !user) return;
    
    const newUploads: ImageUploadStatus[] = Array.from(files).map(file => {
      const id = uuidv4();
      return {
        id,
        file,
        status: 'uploading',
        progress: 0, // Progress is not tracked with this implementation
      };
    });

    onNewUploads(newUploads);
    newUploads.forEach(uploadFile);
    
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
