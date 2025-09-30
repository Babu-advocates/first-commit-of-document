import { useState } from "react";
import { Template } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { extractPlaceholders } from "@/lib/templateUtils";
import { Sparkles } from "lucide-react";

interface TemplateEditorProps {
  template?: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export const TemplateEditor = ({ template, onSave, onCancel }: TemplateEditorProps) => {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>(
    template?.placeholders || []
  );

  const handleContentChange = (value: string) => {
    setContent(value);
    const placeholders = extractPlaceholders(value);
    setDetectedPlaceholders(placeholders);
  };

  const handleSave = () => {
    const templateData: Template = {
      id: template?.id || crypto.randomUUID(),
      name,
      content,
      placeholders: detectedPlaceholders,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(templateData);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) +
        `{{${placeholder}}}` +
        content.substring(end);
      handleContentChange(newContent);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="space-y-6">
        <div>
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Welcome Email, Invoice Template"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="template-content">Template Content</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            Use double curly braces for placeholders: <code className="bg-muted px-1.5 py-0.5 rounded">{"{{Name}}"}</code>
          </p>
          <Textarea
            id="template-content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Dear {{Name}},&#10;&#10;Thank you for your order #{{OrderID}}...&#10;&#10;Best regards,&#10;{{CompanyName}}"
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Quick Insert:</span>
          {["Name", "Email", "Date", "CompanyName", "Phone"].map((ph) => (
            <Button
              key={ph}
              variant="outline"
              size="sm"
              onClick={() => insertPlaceholder(ph)}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {ph}
            </Button>
          ))}
        </div>

        {detectedPlaceholders.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm font-medium mb-2">Detected Placeholders:</p>
            <div className="flex gap-2 flex-wrap">
              {detectedPlaceholders.map((placeholder) => (
                <span
                  key={placeholder}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-mono"
                >
                  {`{{${placeholder}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="flex-1"
          >
            Save Template
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
