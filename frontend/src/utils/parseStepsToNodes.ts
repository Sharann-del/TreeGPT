export interface ParsedStep {
  title: string;
  content: string;
}

export function parseStepsFromSolution(solution: string): ParsedStep[] {
  if (!solution) return [];

  const steps: ParsedStep[] = [];
  
  // Split by step markers - look for "Step X:" pattern anywhere in the text
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
      
      // Extract step content (exclude the step title line)
      const fullStepText = solution.substring(stepStart, stepEnd);
      let stepContent = fullStepText
        .split('\n')
        .slice(1) // Remove the title line
        .join('\n')
        .trim();
      
      // Clean up markdown artifacts
      stepContent = stepContent
        .replace(/^###+\s*$/gm, '') // Remove standalone markdown headers
        .replace(/^###+\s+/gm, '') // Remove markdown headers at start of lines
        .replace(/^#+\s*$/gm, '') // Remove standalone # markers
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
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
  
  return steps;
}

