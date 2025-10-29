"use client";
import { Button } from "@/components/ui/button";
import UploadFile from "@/components/UploadFile";

export default function EditPdfPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit PDF</h1>
      <UploadFile />
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
