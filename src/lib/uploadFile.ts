import { supabase } from './supabaseClient'

export async function handleUpload(file: File) {
  const filePath = `user-uploads/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (error) {
    console.error('❌ Upload failed:', error.message)
    return { success: false, error: error.message }
  }

  console.log('✅ File uploaded:', data.path)
  return { success: true, path: data.path }
}
