import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataRow } from "@/types/template";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ManualFormFillerProps {
  placeholders: string[];
  onComplete: (data: DataRow) => void;
  onBack: () => void;
}

const STORAGE_KEY = "docmerge_manual_form_data";

export const ManualFormFiller = ({
  placeholders,
  onComplete,
  onBack,
}: ManualFormFillerProps) => {
  const [formData, setFormData] = useState<DataRow>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return placeholders.reduce((acc, placeholder) => {
          acc[placeholder] = "";
          return acc;
        }, {} as DataRow);
      }
    }
    return placeholders.reduce((acc, placeholder) => {
      acc[placeholder] = "";
      return acc;
    }, {} as DataRow);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (placeholder: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all fields are filled
    const emptyFields = placeholders.filter(p => !formData[p]);
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all fields: ${emptyFields.join(", ")}`);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    onComplete(formData);
  };

  const isComplete = placeholders.every(p => formData[p]);

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Fill Template Fields</h3>
            <p className="text-sm text-muted-foreground">
              Enter values for each detected field
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {placeholders.map((placeholder) => (
            <div key={placeholder} className="space-y-2">
              <Label htmlFor={placeholder} className="flex items-center gap-2">
                <span className="font-mono text-primary text-sm">
                  {`{${placeholder}}`}
                </span>
                {formData[placeholder] && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </Label>
              <Input
                id={placeholder}
                value={formData[placeholder] as string}
                onChange={(e) => handleInputChange(placeholder, e.target.value)}
                placeholder={`Enter ${placeholder}...`}
                className="font-medium"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm">
            <span className="font-medium text-foreground">
              {placeholders.filter(p => formData[p]).length}
            </span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-medium text-foreground">
              {placeholders.length}
            </span>
            <span className="text-muted-foreground"> fields filled</span>
          </div>
          <Button type="submit" disabled={!isComplete}>
            Generate Document
          </Button>
        </div>
      </form>
    </Card>
  );
};
