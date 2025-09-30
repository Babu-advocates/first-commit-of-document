import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";
import { useState, useEffect } from "react";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onConfirm: (template: Template, newName: string) => void;
}

export const RenameDialog = ({
  open,
  onOpenChange,
  template,
  onConfirm,
}: RenameDialogProps) => {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (template && open) {
      setNewName(template.name);
    }
  }, [template, open]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (template && newName.trim()) {
      onConfirm(template, newName.trim());
      onOpenChange(false);
      setNewName("");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
    setNewName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && template && newName.trim()) {
      e.preventDefault();
      handleConfirm(e as any);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename Template</DialogTitle>
          <DialogDescription>
            Change the template name. This will update the template name permanently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new template name"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!newName.trim()}>
            Confirm Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};