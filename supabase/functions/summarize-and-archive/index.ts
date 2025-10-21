
import { createClient } from '@supabase/supabase-js'
import { summarizeDocument } from '../_utils/ai-flows'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

self.addEventListener('message', async (event) => {
  const { documentId } = event.data

  try {
    // 1. Update document status to 'in-progress'
    await supabase
      .from('documents')
      .update({ processingStatus: 'in-progress' })
      .eq('id', documentId)

    // 2. Fetch document content
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('content, filename')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      throw new Error('Failed to fetch document content.')
    }

    // 3. Run summarization
    const { summary } = await summarizeDocument({
        documentContent: doc.content || `This is the content of the document named ${doc.filename}. In a real application, the full text would be extracted and passed here.`,
    });

    // 4. Update document with summary and mark as complete
    await supabase
      .from('documents')
      .update({
        processingStatus: 'completed',
        isArchived: true,
        archivedAt: new Date().toISOString(),
        archiveSummary: summary,
      })
      .eq('id', documentId)

    self.postMessage({ success: true })
  } catch (error) {
    // Handle errors and update document status to 'failed'
    await supabase
      .from('documents')
      .update({ processingStatus: 'failed' })
      .eq('id', documentId)

    self.postMessage({ success: false, error: error.message })
  }
})
