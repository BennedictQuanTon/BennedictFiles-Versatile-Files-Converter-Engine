export interface Tool {
  id: string;
  name: string;
  category: 'Edit & Compress' | 'Split & Merge' | 'Conversion from PDF' | 'Conversion to PDF';
  description: string;
  iconName: string;
  accepts: string;
  multiple: boolean;
}

export const TOOLS: Tool[] = [
  // Edit & Compress
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    category: 'Edit & Compress',
    description: 'Reduce the file size of your PDF while maintaining print-quality resolution.',
    iconName: 'Minimize2',
    accepts: '.pdf',
    multiple: false,
  },
  {
    id: 'compress-image',
    name: 'Compress Image',
    category: 'Edit & Compress',
    description: 'Compress PNG/JPG images with perceptually lossless optimization.',
    iconName: 'FileImage',
    accepts: '.png,.jpg,.jpeg',
    multiple: false,
  },
  // Split & Merge
  {
    id: 'merge-pdfs',
    name: 'Merge PDFs',
    category: 'Split & Merge',
    description: 'Combine multiple PDF files into one single PDF document.',
    iconName: 'Merge',
    accepts: '.pdf',
    multiple: true,
  },
  {
    id: 'merge-images',
    name: 'Merge Images to PDF',
    category: 'Split & Merge',
    description: 'Compile multiple PNG/JPG images into a single PDF document.',
    iconName: 'Layers',
    accepts: '.png,.jpg,.jpeg',
    multiple: true,
  },
  // Conversion from PDF
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'Conversion from PDF',
    description: 'Convert PDF files to editable DOCX documents using native text layout.',
    iconName: 'FileText',
    accepts: '.pdf',
    multiple: false,
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'Conversion from PDF',
    description: 'Render PDF pages into high-resolution (300 DPI) PNG images.',
    iconName: 'Image',
    accepts: '.pdf',
    multiple: false,
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'Conversion from PDF',
    description: 'Render PDF pages into high-resolution (300 DPI) JPG images.',
    iconName: 'FileDown',
    accepts: '.pdf',
    multiple: false,
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'Conversion from PDF',
    description: 'Convert PDF pages to spreadsheet spreadsheets (XLSX).',
    iconName: 'FileSpreadsheet',
    accepts: '.pdf',
    multiple: false,
  },
  // Conversion to PDF
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'Conversion to PDF',
    description: 'Make DOCX files into vector PDFs with perfect formatting.',
    iconName: 'FileUp',
    accepts: '.docx',
    multiple: false,
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'Conversion to PDF',
    description: 'Convert XLSX spreadsheets into PDF documents.',
    iconName: 'Table',
    accepts: '.xlsx',
    multiple: false,
  },
  {
    id: 'png-jpg-to-pdf',
    name: 'Image to PDF',
    category: 'Conversion to PDF',
    description: 'Convert a PNG or JPG image into a clean PDF document.',
    iconName: 'Sparkles',
    accepts: '.png,.jpg,.jpeg',
    multiple: false,
  },
];
