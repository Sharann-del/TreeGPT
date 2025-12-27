import { TreeState } from '../types';

export function generateShareLink(state: TreeState): string {
  const data = {
    rootId: state.rootId,
    nodes: Array.from(state.nodes.entries()),
    timestamp: Date.now(),
  };
  
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}/share/${encoded}`;
}

export function parseShareLink(encoded: string): TreeState | null {
  try {
    const decoded = atob(encoded);
    const data = JSON.parse(decoded);
    
    return {
      rootId: data.rootId,
      nodes: new Map(data.nodes || []),
    };
  } catch {
    return null;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}

