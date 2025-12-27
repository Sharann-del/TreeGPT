import { TreeNode } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPNG(element: HTMLElement, filename = 'treegpt-export.png'): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    logging: false,
  } as any);
  
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

export async function exportToPDF(element: HTMLElement, filename = 'treegpt-export.pdf'): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    logging: false,
  } as any);
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
}

export function exportToMarkdown(nodes: Map<string, TreeNode>, rootId: string | null): string {
  if (!rootId) return '';
  
  const root = nodes.get(rootId);
  if (!root) return '';
  
  let markdown = `# ${root.title}\n\n`;
  markdown += `${root.problem}\n\n`;
  
  if (root.solution) {
    markdown += `## Solution\n\n${root.solution}\n\n`;
  }
  
  const processNode = (nodeId: string, level = 1): void => {
    const node = nodes.get(nodeId);
    if (!node) return;
    
    const prefix = '#'.repeat(level + 1);
    markdown += `${prefix} ${node.title}\n\n`;
    markdown += `${node.problem}\n\n`;
    
    if (node.solution) {
      markdown += `### Solution\n\n${node.solution}\n\n`;
    }
    
    node.children.forEach(childId => processNode(childId, level + 1));
  };
  
  root.children.forEach(childId => processNode(childId, 1));
  
  return markdown;
}

