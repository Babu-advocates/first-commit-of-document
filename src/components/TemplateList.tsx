import { Template } from "@/types/template";
import { useState, useMemo } from "react";
import { TemplateHeader } from "./templates/TemplateHeader";
import { TemplateSearch } from "./templates/TemplateSearch";
import { TemplateCard } from "./templates/TemplateCard";
import { EmptyState } from "./templates/EmptyState";
import { DeleteConfirmDialog } from "./templates/DeleteConfirmDialog";
import { RenameDialog } from "./templates/RenameDialog";

interface TemplateListProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onUploadWord: () => void;
  onRename: (template: Template, newName: string) => void;
}

export const TemplateList = ({
  templates,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew,
  onUploadWord,
  onRename,
}: TemplateListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleRename = (template: Template) => {
    setSelectedTemplate(template);
    setRenameDialogOpen(true);
  };

  const handleDelete = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleRenameConfirm = (template: Template, newName: string) => {
    onRename(template, newName);
    setSelectedTemplate(null);
  };

  const handleDeleteConfirm = (id: string) => {
    onDelete(id);
    setSelectedTemplate(null);
  };

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="space-y-4">
      <TemplateHeader onCreateNew={onCreateNew} onUploadWord={onUploadWord} />

      {templates.length > 0 && (
        <TemplateSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}

      {filteredTemplates.length === 0 && templates.length > 0 ? (
        <EmptyState type="no-search-results" onClearSearch={clearSearch} />
      ) : templates.length === 0 ? (
        <EmptyState type="no-templates" onCreateNew={onCreateNew} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
              onEdit={onEdit}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        template={selectedTemplate}
        onConfirm={handleDeleteConfirm}
      />

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        template={selectedTemplate}
        onConfirm={handleRenameConfirm}
      />
    </div>
  );
};