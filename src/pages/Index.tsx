import { useState, useEffect } from "react";
import { Template, DataRow, FieldMapping, MergedDocument } from "@/types/template";
import { getTemplates, saveTemplate, deleteTemplate, mergeAllDocuments } from "@/lib/templateUtils";
import { StepIndicator } from "@/components/StepIndicator";
import { TemplateList } from "@/components/TemplateList";
import { TemplateEditor } from "@/components/TemplateEditor";
import { WordTemplateUploader } from "@/components/WordTemplateUploader";
import { DatasetUploader } from "@/components/DatasetUploader";
import { FieldMapper } from "@/components/FieldMapper";
import { DocumentPreview } from "@/components/DocumentPreview";
import { ManualFormFiller } from "@/components/ManualFormFiller";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Upload, FormInput, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
const STEPS = [{
  number: 1,
  title: "Template",
  description: "Create or select"
}, {
  number: 2,
  title: "Data Source",
  description: "Choose input method"
}, {
  number: 3,
  title: "Fill/Map",
  description: "Provide data"
}, {
  number: 4,
  title: "Generate",
  description: "Preview & export"
}];
type ViewMode = "list" | "edit" | "create" | "word-upload";
type DataMode = "dataset" | "manual" | null;
const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [dataMode, setDataMode] = useState<DataMode>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [dataset, setDataset] = useState<DataRow[]>([]);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [mergedDocuments, setMergedDocuments] = useState<MergedDocument[]>([]);
  useEffect(() => {
    loadTemplates();
  }, []);
  const loadTemplates = async () => {
    const loaded = await getTemplates();
    setTemplates(loaded);
  };
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setViewMode("list");
    setDataMode(null);
    setCurrentStep(2);
    toast.success(`Selected: ${template.name}`);
  };
  const handleTemplateEdit = (template: Template) => {
    setEditingTemplate(template);
    setViewMode("edit");
  };
  const handleTemplateSave = async (template: Template, file?: File) => {
    const saved = await saveTemplate(template, file);
    if (saved) {
      await loadTemplates();
      setViewMode("list");
      setEditingTemplate(null);
      toast.success("Template saved successfully");
    } else {
      toast.error("Failed to save template");
    }
  };
  const handleTemplateDelete = async (id: string) => {
    await deleteTemplate(id);
    await loadTemplates();
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
      setCurrentStep(1);
    }
    toast.success("Template deleted");
  };
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setViewMode("create");
  };
  const handleUploadWord = () => {
    setViewMode("word-upload");
  };
  const handleDataModeSelect = (mode: DataMode) => {
    setDataMode(mode);
    setCurrentStep(3);
  };
  const handleDataLoaded = (data: DataRow[], headers: string[]) => {
    setDataset(data);
    setDataHeaders(headers);
    if (data.length > 0) {
      setCurrentStep(3);
    }
  };
  const handleManualDataFilled = (data: DataRow) => {
    setDataset([data]);
    setDataHeaders(Object.keys(data));
    const autoMappings: FieldMapping[] = selectedTemplate!.placeholders.map(p => ({
      placeholder: p,
      dataField: p
    }));
    setFieldMappings(autoMappings);
    const merged = mergeAllDocuments(selectedTemplate!, [data], autoMappings);
    setMergedDocuments(merged);
    setCurrentStep(4);
    toast.success("Document generated successfully");
  };
  const handleMappingComplete = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
    if (selectedTemplate && dataset.length > 0) {
      const merged = mergeAllDocuments(selectedTemplate, dataset, mappings);
      setMergedDocuments(merged);
      setCurrentStep(4);
      toast.success(`Generated ${merged.length} documents`);
    }
  };
  const handleBackToMapping = () => {
    setCurrentStep(3);
  };
  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setDataMode(null);
    setDataset([]);
    setDataHeaders([]);
    setFieldMappings([]);
    setMergedDocuments([]);
    setCurrentStep(1);
  };
  const handleTemplateRename = async (template: Template, newName: string) => {
    const updatedTemplate = {
      ...template,
      name: newName,
      updatedAt: new Date().toISOString()
    };
    const saved = await saveTemplate(updatedTemplate);
    if (saved) {
      await loadTemplates();
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(updatedTemplate);
      }
      toast.success("Template renamed successfully");
    } else {
      toast.error("Failed to rename template");
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="max-w-5xl mx-auto mt-8">
          {/* Step 1: Template Selection/Creation */}
          {currentStep === 1 && <>
              {viewMode === "list" && <TemplateList templates={templates} onSelect={handleTemplateSelect} onEdit={handleTemplateEdit} onDelete={handleTemplateDelete} onCreateNew={handleCreateNew} onUploadWord={handleUploadWord} onRename={handleTemplateRename} />}
              {(viewMode === "edit" || viewMode === "create") && <TemplateEditor template={editingTemplate || undefined} onSave={handleTemplateSave} onCancel={() => setViewMode("list")} />}
              {viewMode === "word-upload" && <WordTemplateUploader onSave={handleTemplateSave} onCancel={() => setViewMode("list")} />}
            </>}

          {/* Step 2: Choose Data Source */}
          {currentStep === 2 && selectedTemplate && !dataMode && <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBackToTemplates}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Templates
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Choose How to Fill Your Template</h2>
                <p className="text-sm text-muted-foreground">
                  Using template: <span className="font-medium text-foreground">{selectedTemplate.name}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-8 cursor-pointer hover:shadow-[var(--shadow-elegant)] transition-all border-2 hover:border-primary" onClick={() => handleDataModeSelect("dataset")}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Upload Dataset</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a CSV file to generate multiple documents at once
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-8 cursor-pointer hover:shadow-[var(--shadow-elegant)] transition-all border-2 hover:border-primary" onClick={() => handleDataModeSelect("manual")}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FormInput className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Fill Manually</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill in the detected fields manually to generate a single document
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>}

          {/* Step 3: Dataset Upload */}
          {currentStep === 3 && selectedTemplate && dataMode === "dataset" && dataset.length === 0 && <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="sm" onClick={handleBackToTemplates}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Templates
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Upload Your Dataset</h2>
                <p className="text-sm text-muted-foreground">
                  Using template: <span className="font-medium text-foreground">{selectedTemplate.name}</span>
                </p>
              </div>
              <DatasetUploader onDataLoaded={handleDataLoaded} />
            </div>}

          {/* Step 3: Manual Form Filling */}
          {currentStep === 3 && selectedTemplate && dataMode === "manual" && <ManualFormFiller placeholders={selectedTemplate.placeholders} onComplete={handleManualDataFilled} onBack={() => {
          setDataMode(null);
          setCurrentStep(2);
        }} />}

          {/* Step 3: Field Mapping (for dataset mode) */}
          {currentStep === 3 && selectedTemplate && dataMode === "dataset" && dataset.length > 0 && <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBackToTemplates}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Templates
                </Button>
              </div>
              <FieldMapper placeholders={selectedTemplate.placeholders} dataFields={dataHeaders} onMappingComplete={handleMappingComplete} />
            </div>}

          {/* Step 4: Preview and Export */}
          {currentStep === 4 && mergedDocuments.length > 0 && selectedTemplate && <DocumentPreview documents={mergedDocuments} template={selectedTemplate} dataset={dataset} mappings={fieldMappings} onBack={handleBackToMapping} />}
        </div>
      </main>
    </div>;
};
export default Index;