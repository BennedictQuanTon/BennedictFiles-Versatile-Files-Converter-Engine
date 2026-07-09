'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TOOLS, Tool } from '../../lib/tools';
import { 
  Minimize2, FileImage, Merge, Layers, 
  FileText, FileDown, FileSpreadsheet, FileUp, 
  Table, Sparkles, HelpCircle 
} from 'lucide-react';
import styles from './ToolGrid.module.css';

const iconMap: Record<string, React.ComponentType<any>> = {
  Minimize2,
  FileImage,
  Merge,
  Layers,
  FileText,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Table,
  Sparkles,
};

export default function ToolGrid() {
  const router = useRouter();

  // Group tools by category
  const categories: Tool['category'][] = [
    'Edit & Compress',
    'Split & Merge',
    'Conversion from PDF',
    'Conversion to PDF'
  ];

  const handleToolClick = (toolId: string) => {
    router.push(`/convert/${toolId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>All-in-One File Engine</h1>
        <p className={styles.subtitle}>
          Upload documents, images, and files, and convert them instantly with high-resolution output quality.
        </p>
      </div>

      {categories.map((category) => {
        const categoryTools = TOOLS.filter((t) => t.category === category);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category} className={styles.categoryGroup}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.grid}>
              {categoryTools.map((tool) => {
                const IconComponent = iconMap[tool.iconName] || HelpCircle;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={styles.toolCard}
                  >
                    <div className={styles.iconWrapper}>
                      <IconComponent size={24} />
                    </div>
                    <h3 className={styles.toolName}>{tool.name}</h3>
                    <p className={styles.toolDesc}>{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
