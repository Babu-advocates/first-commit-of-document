import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MergedDocument, Template, DataRow, FieldMapping } from "@/types/template";
import { ChevronLeft, ChevronRight, Download, Mail, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { mergeWordDocument, downloadWordDocument, mergeAllWordDocuments } from "@/lib/wordDocumentUtils";
import { getTemplateFile } from "@/lib/templateUtils";
interface DocumentPreviewProps {
  documents: MergedDocument[];
  template: Template;
  dataset: DataRow[];
  mappings: FieldMapping[];
  onBack: () => void;
}
export const DocumentPreview = ({
  documents,
  template,
  dataset,
  mappings,
  onBack
}: DocumentPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentDoc = documents[currentIndex];
  const isWordTemplate = template.isWordTemplate;
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(documents.length - 1, prev + 1));
  };
  const downloadSingleDocument = async (index: number) => {
    setIsGenerating(true);
    try {
      if (isWordTemplate) {
        if (!template.wordDocumentData) {
          throw new Error('No template file path found');
        }
        const templateBlob = await getTemplateFile(template.wordDocumentData);
        if (!templateBlob) {
          throw new Error('Failed to fetch template file');
        }
        const rowData = dataset[index];
        const arrayBuffer = await mergeWordDocument(templateBlob, rowData, mappings);
        downloadWordDocument(arrayBuffer, `document-${index + 1}.docx`);
        toast.success("Word document downloaded");
      } else {
        const doc = documents[index];
        const blob = new Blob([doc.content], {
          type: 'text/html'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${index + 1}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Document downloaded");
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error("Error generating document");
    } finally {
      setIsGenerating(false);
    }
  };
  const downloadAllAsZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      if (isWordTemplate) {
        if (!template.wordDocumentData) {
          throw new Error('No template file path found');
        }
        const templateBlob = await getTemplateFile(template.wordDocumentData);
        if (!templateBlob) {
          throw new Error('Failed to fetch template file');
        }
        const allDocuments = await mergeAllWordDocuments(templateBlob, dataset, mappings);
        allDocuments.forEach((arrayBuffer, index) => {
          zip.file(`document-${index + 1}.docx`, arrayBuffer);
        });
      } else {
        documents.forEach((doc, index) => {
          zip.file(`document-${index + 1}.html`, doc.content);
        });
      }
      const blob = await zip.generateAsync({
        type: 'blob'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged-documents-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${documents.length} documents as ZIP`);
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast.error("Error creating ZIP file");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleEmailDocuments = () => {
    toast.loading("Email feature coming soon! Connect to Cloud to enable automated emails.");
  };
  return <div className="space-y-6">
      

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h4 className="font-semibold mb-4">Export Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => downloadSingleDocument(currentIndex)} disabled={isGenerating} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : `Download This ${isWordTemplate ? '(.docx)' : '(.html)'}`}
          </Button>
          <Button onClick={downloadAllAsZip} disabled={isGenerating} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : `Download All as ZIP`}
          </Button>
        </div>
        <Button variant="secondary" onClick={handleEmailDocuments} className="w-full mt-3">
          <Mail className="w-4 h-4 mr-2" />
          Email All Documents
        </Button>
        <Button variant="ghost" onClick={onBack} className="w-full mt-3">
          Back to Field Mapping
        </Button>
      </Card>
    </div>;
};