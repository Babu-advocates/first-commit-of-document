export interface Template {
  id: string;
  name: string;
  content: string;
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
  wordDocumentData?: string; // Base64 encoded Word document
  isWordTemplate?: boolean;
}

export interface DataRow {
  [key: string]: string | number;
}

export interface FieldMapping {
  placeholder: string;
  dataField: string;
}

export interface MergedDocument {
  id: string;
  content: string;
  rowData: DataRow;
}
