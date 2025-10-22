
'use client'

import Link from 'next/link'
import {
  Edit,
  Signature,
  FileCog,
  Combine,
  Split,
  Minimize,
  ScanText,
  Sparkles,
  MessageSquare,
  Gavel,
  FileEdit,
  Languages,
} from 'lucide-react'

const mainTools = [
  { icon: Edit, title: 'Edit PDF', description: 'Edit text, rearrange, or replace content.', href: '/documents' },
  { icon: Signature, title: 'Sign PDF', description: 'Draw or upload your signature.', href: '/documents' },
  { icon: FileCog, title: 'Convert PDF', description: 'To/from DOCX, JPG, PNG, etc.', href: '/convert' },
  { icon: Combine, title: 'Merge PDFs', description: 'Combine multiple files into one.', href: '/merge' },
  { icon: Split, title: 'Split PDF', description: 'Extract pages from a document.', href: '/split' },
  { icon: Minimize, title: 'Compress PDF', description: 'Reduce file size for easy sharing.', href: '/compress' },
  { icon: ScanText, title: 'OCR & Scan Text', description: 'Convert scans into editable text.', href: '/analyze' },
  { icon: Sparkles, title: 'AI Summarize', description: 'Generate instant summaries.', href: '/analyze' },
  { icon: MessageSquare, title: 'Ask-the-PDF', description: 'Chat with your document.', href: '/documents' },
  { icon: Gavel, title: 'Legal Checker', description: 'Analyze contracts for risks.', href: '/legal' },
  { icon: FileEdit, title: 'Rewrite Text', description: 'Improve tone, clarity, and style.', href: '/rewrite' },
  { icon: Languages, title: 'Translate Text', description: 'Into any language, instantly.', href: '/translate' },
]

export const MainToolsGrid = () => {
  return (
    <section className="py-12 md:py-20 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {mainTools.map((tool, index) => (
            <Link key={tool.title} href={tool.href} className="group">
              <div className="text-center p-4 md:p-6 rounded-xl border bg-card shadow-sm card-hover-effect">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm md:text-base">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 hidden xl:block">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
