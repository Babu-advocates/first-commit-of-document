import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface TemplateHeaderProps {
  onCreateNew: () => void;
  onUploadWord: () => void;
}

export const TemplateHeader = ({ onCreateNew, onUploadWord }: TemplateHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold">Your Templates</h3>
        <p className="text-sm text-muted-foreground">
          Select a template or create a new one
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onUploadWord} variant="outline" className="flex-1 sm:flex-none">
          <FileText className="w-4 h-4 mr-2" />
          <span className="whitespace-nowrap">Upload Word</span>
        </Button>
        <Button onClick={onCreateNew} className="flex-1 sm:flex-none">
          <Plus className="w-4 h-4 mr-2" />
          <span className="whitespace-nowrap">New Template</span>
        </Button>
      </div>
    </div>
  );
};