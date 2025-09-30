import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { Template, DataRow, FieldMapping } from '@/types/template';

export const extractPlaceholdersFromWord = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as ArrayBuffer;
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        const text = doc.getFullText();
        const regex = /\{([^}]+)\}/g;
        const placeholders = new Set<string>();
        let match;

        while ((match = regex.exec(text)) !== null) {
          placeholders.add(match[1].trim());
        }

        resolve(Array.from(placeholders));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:application/... prefix
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return await blob.arrayBuffer();
};

export const mergeWordDocument = async (
  templateBlob: Blob,
  rowData: DataRow,
  mappings: FieldMapping[]
): Promise<ArrayBuffer> => {
  const content = await blobToArrayBuffer(templateBlob);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Create data object for docxtemplater
  const data: { [key: string]: string | number } = {};
  mappings.forEach(mapping => {
    const value = rowData[mapping.dataField] || '';
    data[mapping.placeholder] = value;
  });

  doc.render(data);

  return doc.getZip().generate({
    type: 'arraybuffer',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
};

export const downloadWordDocument = (arrayBuffer: ArrayBuffer, filename: string) => {
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  saveAs(blob, filename);
};

export const mergeAllWordDocuments = async (
  templateBlob: Blob,
  dataset: DataRow[],
  mappings: FieldMapping[]
): Promise<ArrayBuffer[]> => {
  return await Promise.all(
    dataset.map(row => mergeWordDocument(templateBlob, row, mappings))
  );
};
