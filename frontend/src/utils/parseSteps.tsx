import React from 'react';
import { renderMarkdown } from './markdown';

export function parseAndRenderSteps(solution: string, codeColor: 'blue' | 'green' = 'green'): React.ReactNode[] {
  if (!solution) return [];

  const steps: Array<{ title: string; content: string }> = [];
  
  // Split by step markers - look for "Step X:" pattern anywhere in the text
  // First, try to split the entire solution by step markers
  const stepSplitPattern = /(Step\s+\d+[:\s])/gi;
  const stepMatches = [...solution.matchAll(stepSplitPattern)];
  
  // If we found step markers, split by them
  if (stepMatches.length > 0) {
    let lastIndex = 0;
    stepMatches.forEach((match, index) => {
      if (match.index === undefined) return;
      
      // Get content before this step (if any)
      if (match.index > lastIndex && index === 0) {
        const beforeContent = solution.substring(lastIndex, match.index).trim();
        if (beforeContent) {
          steps.push({
            title: 'Solution',
            content: beforeContent
          });
        }
      }
      
      // Extract step title
      const stepLine = solution.substring(match.index).split('\n')[0];
      const titleMatch = stepLine.match(/Step\s+(\d+)[:\s]+\s*(.*)$/i);
      const stepTitle = titleMatch 
        ? (titleMatch[2] ? `Step ${titleMatch[1]}: ${titleMatch[2].trim()}` : `Step ${titleMatch[1]}`)
        : stepLine.trim();
      
      // Get content for this step (until next step or end)
      const stepStart = match.index;
      const stepEnd = index < stepMatches.length - 1 && stepMatches[index + 1].index !== undefined
        ? stepMatches[index + 1].index!
        : solution.length;
      
      // Extract step content (skip the step title line)
      const stepContent = solution.substring(stepStart, stepEnd)
        .split('\n')
        .slice(1) // Skip the title line
        .join('\n')
        .trim();
      
      steps.push({
        title: stepTitle,
        content: stepContent
      });
      
      lastIndex = stepEnd;
    });
  } else {
    // No step markers found - treat as single step
    steps.push({
      title: 'Solution',
      content: solution
    });
  }
  
  // Debug: log how many steps were found
  console.log('Parsed steps:', steps.length, steps.map(s => s.title));

  // Render each step as a box
  return steps.map((step, index) => (
    <div
      key={`step-${index}`}
      className="mb-4 p-5 rounded-xl bg-gradient-to-br from-white/8 via-cyan-400/10 to-blue-400/8 border-2 border-cyan-400/40 backdrop-blur-sm shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-cyan-400/60 rounded-full" />
        <div className="text-sm font-semibold text-white">
          {step.title}
        </div>
      </div>
      <div className="text-sm text-white/90 leading-relaxed">
        {renderMarkdown(step.content.trim(), codeColor)}
      </div>
    </div>
  ));
}

