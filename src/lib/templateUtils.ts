import { Template, DataRow, FieldMapping, MergedDocument } from '@/types/template';
import { supabase } from "@/integrations/supabase/client";

export const extractPlaceholders = (content: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const placeholders = new Set<string>();
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    placeholders.add(match[1].trim());
  }
  
  return Array.from(placeholders);
};

export const mergeSingleDocument = (
  template: Template,
  rowData: DataRow,
  mappings: FieldMapping[]
): string => {
  let content = template.content;
  
  mappings.forEach(mapping => {
    const value = rowData[mapping.dataField] || '';
    const regex = new RegExp(`\\{\\{\\s*${mapping.placeholder}\\s*\\}\\}`, 'g');
    content = content.replace(regex, String(value));
  });
  
  return content;
};

export const mergeAllDocuments = (
  template: Template,
  dataset: DataRow[],
  mappings: FieldMapping[]
): MergedDocument[] => {
  return dataset.map((row, index) => ({
    id: `doc-${index}`,
    content: mergeSingleDocument(template, row, mappings),
    rowData: row
  }));
};

export const saveTemplate = async (template: Template, file?: File): Promise<Template | null> => {
  try {
    let storagePath = template.wordDocumentData;

    // Upload file to storage if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${template.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('word-templates')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      storagePath = filePath;
    }

    // Check if template exists
    // @ts-ignore - Table types will be updated after migration
    const { data: existing } = await supabase.from('templates').select('id').eq('id', template.id).maybeSingle();

    if (existing) {
      // Update existing template
      // @ts-ignore - Table types will be updated after migration
      const { data, error } = await supabase.from('templates').update({ name: template.name, placeholders: template.placeholders, storage_path: storagePath }).eq('id', template.id).select().single();

      if (error) throw error;
      return data as any;
    } else {
      // Insert new template
      // @ts-ignore - Table types will be updated after migration
      const { data, error } = await supabase.from('templates').insert({ id: template.id, name: template.name, placeholders: template.placeholders, storage_path: storagePath || '' }).select().single();

      if (error) throw error;
      return data as any;
    }
  } catch (error) {
    console.error('Error saving template:', error);
    return null;
  }
};

export const getTemplates = async (): Promise<Template[]> => {
  // @ts-ignore - Table types will be updated after migration
  const { data, error } = await supabase.from('templates').select('*').order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    content: '', // Not needed for Word templates
    placeholders: row.placeholders,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    wordDocumentData: row.storage_path, // Store path instead of base64
    isWordTemplate: true,
  }));
};

export const getTemplate = async (id: string): Promise<Template | null> => {
  // @ts-ignore - Table types will be updated after migration
  const { data, error } = await supabase.from('templates').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: (data as any).id,
    name: (data as any).name,
    content: '',
    placeholders: (data as any).placeholders,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
    wordDocumentData: (data as any).storage_path,
    isWordTemplate: true,
  };
};

export const deleteTemplate = async (id: string): Promise<void> => {
  // Get template to find storage path
  // @ts-ignore - Table types will be updated after migration
  const { data: template } = await supabase.from('templates').select('storage_path').eq('id', id).maybeSingle();

  if (template && (template as any).storage_path) {
    // Delete file from storage
    await supabase.storage.from('word-templates').remove([(template as any).storage_path]);
  }

  // Delete template record
  // @ts-ignore - Table types will be updated after migration
  const { error } = await supabase.from('templates').delete().eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
  }
};

export const getTemplateFile = async (storagePath: string): Promise<Blob | null> => {
  const { data, error } = await supabase.storage.from('word-templates').download(storagePath);

  if (error) {
    console.error('Error downloading template:', error);
    return null;
  }

  return data;
};
