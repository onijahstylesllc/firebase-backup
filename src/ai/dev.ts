import { config } from 'dotenv';
config();

import '@/ai/flows/ai-summarize-meeting-context.ts';
import '@/ai/flows/ai-archive-old-docs.ts';
import '@/ai/flows/ai-auto-generate-file-names.ts';
import '@/ai/flows/ai-chat-flow.ts';
import '@/ai/flows/ai-legal-checker.ts';
import '@/ai/flows/ai-policy-checker.ts';
import '@/ai/flows/ai-math-solver.ts';
import '@/ai/ai-rewrite-text.ts';
import '@/ai/ai-translate-text.ts';
import '@/ai/flows/ai-analyze-document.ts';
import '@/ai/flows/ai-compress-document.ts';
import '@/ai/flows/ai-convert-document.ts';
import '@/ai/flows/ai-merge-documents.ts';
import '@/ai/flows/ai-split-document.ts';
