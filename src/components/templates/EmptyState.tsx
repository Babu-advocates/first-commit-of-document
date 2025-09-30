import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Plus } from "lucide-react";

interface EmptyStateProps {
  type: "no-templates" | "no-search-results";
  onCreateNew?: () => void;
  onClearSearch?: () => void;
}

export const EmptyState = ({ type, onCreateNew, onClearSearch }: EmptyStateProps) => {
  if (type === "no-search-results") {
    return (
      <Card className="p-12 text-center shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold mb-1">No templates found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </div>
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold mb-1">No templates yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first template to get started
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
    </Card>
  );
};