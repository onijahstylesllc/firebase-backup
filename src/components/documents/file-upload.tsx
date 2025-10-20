
'use client';

import React, { useRef, ReactNode } from 'react';
import { useFirebase } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const { firestore, user } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = (upload: FileUploadStatus) => {
    if (!user || !firestore) return;

    const storage = getStorage();
    // Use the unique upload ID in the storage path to prevent overwrites
    const storagePath = `users/${user.uid}/documents/${upload.id}-${upload.file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, upload.file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onUploadProgress(upload.id, progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        onUploadStatusChange(upload.id, 'failed', error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        try {
            if (!user) throw new Error("User not authenticated");
            const userDocsCollection = collection(firestore, 'users', user.uid, 'documents');
            await addDoc(userDocsCollection, {
                filename: upload.file.name,
                owner: user.displayName || user.email,
                uploadDate: serverTimestamp(),
                fileSize: upload.file.size,
                contentType: upload.file.type,
                storageLocation: storagePath,
                downloadURL: downloadURL,
            });
            onUploadStatusChange(upload.id, 'completed');
        } catch (error) {
            console.error("Error adding document to Firestore:", error);
            onUploadStatusChange(upload.id, 'failed', (error as Error).message);
        }
      }
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;
    
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
