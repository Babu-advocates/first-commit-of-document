import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { Template } from "@/types/template";
import { extractPlaceholdersFromWord, fileToBase64 } from "@/lib/wordDocumentUtils";
import { toast } from "react-hot-toast";

interface WordTemplateUploaderProps {
  onSave: (template: Template, file?: File) => void;
  onCancel: () => void;
}

export const WordTemplateUploader = ({ onSave, onCancel }: WordTemplateUploaderProps) => {
  const [templateName, setTemplateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.docx?$/i)) {
      toast.error("Please upload a Word document (.docx)");
      return;
    }

    setIsProcessing(true);
    setFile(selectedFile);
    
    if (!templateName) {
      setTemplateName(selectedFile.name.replace(/\.docx?$/i, ''));
    }

    try {
      const extractedPlaceholders = await extractPlaceholdersFromWord(selectedFile);
      setPlaceholders(extractedPlaceholders);
      toast.success(`Found ${extractedPlaceholders.length} placeholders in document`);
    } catch (error) {
      console.error('Error processing Word document:', error);
      toast.error("Error reading Word document. Make sure placeholders use {FieldName} format.");
    } finally {
      setIsProcessing(false);
    }
  }, [templateName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleSave = async () => {
    if (!file || !templateName.trim()) {
      toast.error("Please provide a template name and upload a document");
      return;
    }

    setIsProcessing(true);
    try {
      const template: Template = {
        id: crypto.randomUUID(),
        name: templateName.trim(),
        content: '',
        placeholders,
        wordDocumentData: '',
        isWordTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSave(template, file);
      toast.success("Word template saved successfully");
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error("Error saving template");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPlaceholders([]);
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Word Template</h3>
          <p className="text-sm text-muted-foreground">
            Upload a .docx file with placeholders in <code className="bg-muted px-1.5 py-0.5 rounded">{"{FieldName}"}</code> format
          </p>
        </div>

        <div>
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Contract Template, Invoice"
            className="mt-2"
          />
        </div>

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">Upload Word Document</p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your .docx file here, or click to browse
                </p>
              </div>
              <input
                type="file"
                id="word-file-upload"
                className="hidden"
                accept=".doc,.docx"
                onChange={handleFileInput}
              />
              <Button asChild disabled={isProcessing}>
                <label htmlFor="word-file-upload" className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Choose File"}
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {placeholders.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">
                    Detected {placeholders.length} placeholders:
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {placeholders.map((placeholder) => (
                    <span
                      key={placeholder}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-mono"
                    >
                      {`{${placeholder}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!file || !templateName.trim() || isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Save Template"}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
