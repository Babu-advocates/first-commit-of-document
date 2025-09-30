import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Template } from "@/types/template";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  template,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  if (!template) return null;

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm(template.id);
    onOpenChange(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this template?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This template "{template.name}" will be permanently deleted and cannot be recovered in the future.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};