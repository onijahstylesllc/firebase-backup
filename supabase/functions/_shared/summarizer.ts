/**
 * Shared utility for document summarization
 * This is a simplified version that can be used in Edge Functions
 */

export async function generateSummary(
  documentContent: string,
  filename: string
): Promise<string> {
  // In a production environment, you would call an AI API here
  // For now, return a placeholder summary
  const contentPreview = documentContent.substring(0, 200);
  return `Summary of ${filename}: ${contentPreview}...`;
}
