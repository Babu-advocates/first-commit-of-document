import { Template } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  onEdit: (template: Template) => void;
  onRename: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export const TemplateCard = ({
  template,
  onSelect,
  onEdit,
  onRename,
  onDelete,
}: TemplateCardProps) => {
  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename(template);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(template);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(template);
  };

  return (
    <Card
      className="p-5 hover:shadow-[var(--shadow-elegant)] transition-shadow cursor-pointer group"
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRenameClick}
            title="Rename template"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {!template.isWordTemplate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              title="Edit template content"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            title="Delete template"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <h4 className="font-semibold mb-3">{template.name}</h4>
      <p className="text-xs text-muted-foreground">
        Updated {format(new Date(template.updatedAt), "MMM d, yyyy")}
      </p>
    </Card>
  );
};