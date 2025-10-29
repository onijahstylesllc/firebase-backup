import { supabase } from './supabaseClient';
import { sanitizeFilename } from './security/sanitize';
import { validateDocumentFile } from './security/validation';
import { v4 as uuidv4 } from 'uuid';

export async function handleUpload(file: File) {
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid file' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const sanitizedFilename = sanitizeFilename(file.name);
  const fileId = uuidv4();
  const sanitizedUserId = user.id.replace(/[^a-zA-Z0-9-_]/g, '');
  const filePath = `user-uploads/${sanitizedUserId}/${fileId}-${sanitizedFilename}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, path: data.path };
}
