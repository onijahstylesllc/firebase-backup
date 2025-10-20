
'use client';

import React, { useRef, ReactNode } from 'react';
import { useFirebase } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  const { user } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = (upload: ImageUploadStatus) => {
    if (!user) return;

    const storage = getStorage();
    const storagePath = `users/${user.uid}/document-images/${documentId}/${upload.id}-${upload.file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, upload.file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onUploadProgress(upload.id, progress);
      },
      (error) => {
        console.error('Image upload failed:', error);
        // Maybe add an onUploadFailed callback if needed
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadCompleted(upload.id, downloadURL);
      }
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;
    
    const newUploads: ImageUploadStatus[] = Array.from(files).map(file => {
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
    
    