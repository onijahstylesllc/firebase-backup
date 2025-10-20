
'use client';

import { useState, useMemo } from 'react';
import { BookMarked, Search, FilePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import templatesData from '@/lib/templates.json';
import { getTemplateContent } from '@/lib/template-content';
import { NewDocumentDialog } from '@/components/documents/new-document-dialog';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewDocDialogOpen, setIsNewDocDialogOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [selectedTemplateContent, setSelectedTemplateContent] = useState('');

  const categories = useMemo(() => {
    const allCategories = templatesData.templates.map(t => t.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredTemplates = useMemo(() => {
    return templatesData.templates.filter(template =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleUseTemplate = (templateId: string, templateTitle: string) => {
    setSelectedTemplateName(templateTitle);
    setSelectedTemplateContent(getTemplateContent(templateId));
    setIsNewDocDialogOpen(true);
  };

  return (
    <>
      <NewDocumentDialog
        open={isNewDocDialogOpen}
        onOpenChange={setIsNewDocDialogOpen}
        initialName={selectedTemplateName}
        initialContent={selectedTemplateContent}
      />
      <div className="grid gap-8 animate-fade-in">
        <div className="mb-2">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BookMarked className="h-8 w-8" />
            Templates
          </h1>
          <p className="text-muted-foreground">
            Start from a pre-built template to create your documents faster.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10 max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="All" className="w-full">
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(category === 'All' ? filteredTemplates : filteredTemplates.filter(t => t.category === category)).map((template, i) => (
                  <Card key={template.id} className="flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-fade-slide-up" style={{ animationDelay: `${i * 50}ms`}}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription className="line-clamp-3 h-[60px]">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1"></CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleUseTemplate(template.id, template.title)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
               {filteredTemplates.filter(t => category === 'All' || t.category === category).length === 0 && (
                  <div className="text-center py-16 text-muted-foreground flex flex-col items-center rounded-lg border-2 border-dashed animate-fade-in">
                      <Search className="mx-auto h-16 w-16" />
                      <h3 className="mt-4 text-xl font-semibold text-foreground">No Templates Found</h3>
                      <p className="mt-1 max-w-sm">
                        Your search for "{searchQuery}" did not match any templates in this category.
                      </p>
                  </div>
                )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
