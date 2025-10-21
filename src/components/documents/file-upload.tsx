
'use client';

import React, { useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';


export interface FileUploadStatus {
  id: string;
  file: File;
  status: 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  children: ReactNode;
  onNewUploads: (uploads: FileUploadStatus[]) => void;
  onUploadProgress: (id: string, progress: number) => void;
  onUploadStatusChange: (id: string, status: 'completed' | 'failed', error?: string) => void;
  acceptedFileTypes?: string[];
}

export function FileUpload({
  children,
  onNewUploads,
  onUploadProgress,
  onUploadStatusChange,
  acceptedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (upload: FileUploadStatus) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const filePath = `public/${user.id}/${upload.id}-${upload.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, upload.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: upload.file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('documents').insert([
        {
          filename: upload.file.name,
          owner: user.email,
          uploadDate: new Date().toISOString(),
          fileSize: upload.file.size,
          contentType: upload.file.type,
          storageLocation: filePath,
          downloadURL: publicUrl,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      onUploadStatusChange(upload.id, 'completed');
    } catch (error: any) {
      console.error('Upload failed:', error);
      onUploadStatusChange(upload.id, 'failed', error.message);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newUploads: FileUploadStatus[] = Array.from(files).map(file => {
      const id = uuidv4();
      return {
        id,
        file,
        status: 'uploading',
        progress: 0,
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
