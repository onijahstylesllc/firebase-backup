'use client'
import { useState } from 'react'
import { handleUpload } from '@/lib/uploadFile'

export default function UploadFile() {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setFileName(file.name)
    setUploadStatus('Uploading...')

    const result = await handleUpload(file)

    if (result.success) {
      setUploadStatus(`✅ Uploaded: ${result.path}`)
    } else {
      setUploadStatus(`❌ Failed: ${result.error}`)
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
      <input
        type="file"
        onChange={onFileChange}
        disabled={uploading}
        className="mb-4"
      />
      <p>{fileName && `File: ${fileName}`}</p>
      <p>{uploadStatus}</p>
    </div>
  )
}
