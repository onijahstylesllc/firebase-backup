
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadFile } from "@/components/UploadFile";

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit PDF</h1>
      <UploadFile onFileChange={handleFileChange} />
      {file && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Selected File:</h2>
          <p>{file.name}</p>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Editing Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline">Edit Text</Button>
          <Button variant="outline">Add Image</Button>
          <Button variant="outline">Add Shapes</Button>
          <Button variant="outline">Highlight Text</Button>
          <Button variant="outline">Add Watermark</Button>
          <Button variant="outline">Merge & Split</Button>
        </div>
      </div>
    </div>
  );
}
