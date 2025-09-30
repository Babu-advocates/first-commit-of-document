import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldMapping } from "@/types/template";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface FieldMapperProps {
  placeholders: string[];
  dataFields: string[];
  onMappingComplete: (mappings: FieldMapping[]) => void;
}

export const FieldMapper = ({
  placeholders,
  dataFields,
  onMappingComplete,
}: FieldMapperProps) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  useEffect(() => {
    // Auto-map matching field names
    const autoMappings: FieldMapping[] = [];
    placeholders.forEach((placeholder) => {
      const match = dataFields.find(
        (field) => field.toLowerCase() === placeholder.toLowerCase()
      );
      if (match) {
        autoMappings.push({ placeholder, dataField: match });
      }
    });
    setMappings(autoMappings);
  }, [placeholders, dataFields]);

  const handleMappingChange = (placeholder: string, dataField: string) => {
    setMappings((prev) => {
      const existing = prev.filter((m) => m.placeholder !== placeholder);
      return [...existing, { placeholder, dataField }];
    });
  };

  const isComplete = placeholders.length > 0 && mappings.length === placeholders.length;

  const handleComplete = () => {
    if (isComplete) {
      onMappingComplete(mappings);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Map Fields to Placeholders</h3>
          <p className="text-sm text-muted-foreground">
            Connect your data fields to template placeholders
          </p>
        </div>

        <div className="space-y-4">
          {placeholders.map((placeholder) => {
            const currentMapping = mappings.find(
              (m) => m.placeholder === placeholder
            );
            return (
              <div
                key={placeholder}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Template Placeholder
                  </Label>
                  <div className="px-3 py-2 bg-primary/10 text-primary rounded-md font-mono text-sm">
                    {`{{${placeholder}}}`}
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Data Field
                  </Label>
                  <Select
                    value={currentMapping?.dataField || ""}
                    onValueChange={(value) =>
                      handleMappingChange(placeholder, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dataFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentMapping && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm">
            <span className="font-medium text-foreground">{mappings.length}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-medium text-foreground">{placeholders.length}</span>
            <span className="text-muted-foreground"> fields mapped</span>
          </div>
          <Button onClick={handleComplete} disabled={!isComplete}>
            Continue to Preview
          </Button>
        </div>
      </div>
    </Card>
  );
};
