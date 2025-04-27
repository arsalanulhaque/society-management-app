import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IUser, IRole, IPlotType, IPlotCategory } from '@/types/database';

export const DocumentTemplatesTab: React.FC = () => {
    const documentTemplates = [
      { id: 1, name: 'Welcome Letter', description: 'Standard welcome letter for new residents', content: 'Dear {RESIDENT_NAME},\n\nWelcome to our community...' },
      { id: 2, name: 'Maintenance Request Form', description: 'Form for residents to request maintenance', content: 'Maintenance Request\n\nDate: {DATE}\nRequested by: {RESIDENT_NAME}\n...' },
      { id: 3, name: 'Late Payment Notice', description: 'Notice for late maintenance fee payments', content: 'NOTICE: LATE PAYMENT\n\nDear {RESIDENT_NAME},\n\nThis is to inform you that your payment...' }
    ];
  
    const templateFormSchema = z.object({
      name: z.string().min(1, "Template name is required"),
      description: z.string().min(1, "Description is required"),
      content: z.string().min(1, "Content is required")
    });
  
    const [selectedTemplate, setSelectedTemplate] = useState<typeof documentTemplates[0] | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
  
    const form = useForm<z.infer<typeof templateFormSchema>>({
      resolver: zodResolver(templateFormSchema),
      defaultValues: {
        name: "",
        description: "",
        content: ""
      }
    });
  
    const handleAddTemplate = () => {
      setSelectedTemplate(null);
      form.reset({
        name: "",
        description: "",
        content: ""
      });
      setIsFormVisible(true);
      setPreviewMode(false);
    };
  
    const handleEditTemplate = (template: typeof documentTemplates[0]) => {
      setSelectedTemplate(template);
      form.reset({
        name: template.name,
        description: template.description,
        content: template.content
      });
      setIsFormVisible(true);
      setPreviewMode(false);
    };
  
    const handlePreviewTemplate = (template: typeof documentTemplates[0]) => {
      setSelectedTemplate(template);
      setPreviewMode(true);
    };
  
    const onSubmit = (data: z.infer<typeof templateFormSchema>) => {
      const action = selectedTemplate ? "updated" : "created";
      toast.success(`Document template ${action} successfully`);
      setIsFormVisible(false);
    };
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Document Templates</h2>
          <Button onClick={handleAddTemplate} className="flex items-center gap-2">
            <Plus size={16} />
            Add New Template
          </Button>
        </div>
  
        {isFormVisible && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedTemplate ? "Edit Document Template" : "Add New Document Template"}</CardTitle>
              <CardDescription>
                {selectedTemplate ? "Update template details" : "Create a new document template"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormDescription>
                          Use placeholders like {"{RESIDENT_NAME}"}, {"{DATE}"}, etc. which will be replaced with actual values.
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter template content" 
                            className="min-h-[300px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsFormVisible(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedTemplate ? "Update Template" : "Create Template"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
  
        {previewMode && selectedTemplate && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Template Preview: {selectedTemplate.name}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(false)}
              >
                Close Preview
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-md border whitespace-pre-wrap font-mono">
                {selectedTemplate.content}
              </div>
            </CardContent>
          </Card>
        )}
  
        <Card>
          <CardHeader>
            <CardTitle>Document Templates</CardTitle>
            <CardDescription>
              Manage document templates for various communication needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
                <div className="col-span-3">Template Name</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-4">Actions</div>
              </div>
              {documentTemplates.map(template => (
                <div key={template.id} className="grid grid-cols-12 p-4 border-t items-center text-sm">
                  <div className="col-span-3">{template.name}</div>
                  <div className="col-span-5">{template.description}</div>
                  <div className="col-span-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex items-center gap-1"
                    >
                      <FileText size={14} />
                      <span>Preview</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTemplate(template)}
                      className="flex items-center gap-1"
                    >
                      <PenSquare size={14} />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      onClick={() => toast.success('Template deleted successfully')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };