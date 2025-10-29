import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { generateSummary } from '../_shared/summarizer.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { documentId } = await req.json()

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing documentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // 3. Generate summary
    const documentContent = doc.content || `This is the content of the document named ${doc.filename}. In a real application, the full text would be extracted and passed here.`
    const summary = await generateSummary(documentContent, doc.filename)

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

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing document:', error)

    // Try to update document status to 'failed' if we have documentId
    try {
      const { documentId } = await req.json()
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if (supabaseUrl && supabaseServiceRoleKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
          await supabase
            .from('documents')
            .update({ processingStatus: 'failed' })
            .eq('id', documentId)
        }
      }
    } catch (e) {
      console.error('Error updating document status:', e)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
