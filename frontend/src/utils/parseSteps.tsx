import React from 'react';
import { motion } from 'framer-motion';
import { renderMarkdown } from './markdown';

export function parseAndRenderSteps(solution: string, codeColor: 'blue' | 'green' | 'emerald' = 'green', noGaps: boolean = false): React.ReactNode[] {
  if (!solution) return [];

  const steps: Array<{ title: string; content: string }> = [];

  // Split by step markers - look for various step patterns
  // Patterns: "Step X:", "Step X", "X.", numbered lists, etc.
  const stepPatterns = [
    /(Step\s+\d+[:\s])/gi,  // "Step 1:", "Step 1 "
    /(^\d+\.\s)/gm,        // "1. " at start of line
    /(^\d+\)\s)/gm,        // "1) " at start of line
  ];

  let stepMatches: Array<{ index: number; pattern: RegExpMatchArray }> = [];
  
  // Try each pattern
  for (const pattern of stepPatterns) {
    const matches = [...solution.matchAll(pattern)];
    if (matches.length > 0) {
      stepMatches = matches.map(m => ({ index: m.index!, pattern: m }));
      break;
    }
  }

  // If we found step markers, split by them
  if (stepMatches.length > 0) {
    let lastIndex = 0;
    stepMatches.forEach((matchObj, index) => {
      const matchIndex = matchObj.index;
      if (matchIndex === undefined) return;

      // Get content before this step (if any)
      if (matchIndex > lastIndex && index === 0) {
        const beforeContent = solution.substring(lastIndex, matchIndex).trim();
        if (beforeContent) {
          steps.push({
            title: 'Solution',
            content: beforeContent
          });
        }
      }

      // Extract step title - try different patterns
      const stepLine = solution.substring(matchIndex).split('\n')[0];
      let stepTitle = '';
      
      // Try "Step X:" pattern
      const stepMatch = stepLine.match(/Step\s+(\d+)[:\s]+\s*(.*)$/i);
      if (stepMatch) {
        stepTitle = stepMatch[2] ? `Step ${stepMatch[1]}: ${stepMatch[2].trim()}` : `Step ${stepMatch[1]}`;
      } else {
        // Try numbered list pattern "1. " or "1) "
        const numberedMatch = stepLine.match(/^(\d+)[.)]\s*(.*)$/);
        if (numberedMatch) {
          stepTitle = numberedMatch[2] ? `Step ${numberedMatch[1]}: ${numberedMatch[2].trim()}` : `Step ${numberedMatch[1]}`;
        } else {
          stepTitle = stepLine.trim();
        }
      }

      // Get content for this step (until next step or end)
      const stepStart = matchIndex;
      const stepEnd = index < stepMatches.length - 1 && stepMatches[index + 1].index !== undefined
        ? stepMatches[index + 1].index!
        : solution.length;

      // Extract step content (skip the step title line)
      let stepContent = solution.substring(stepStart, stepEnd)
        .split('\n')
        .slice(1) // Skip the title line
        .join('\n')
        .trim();
      
      // Clean up markdown header artifacts
      stepContent = stepContent
        .replace(/^#{1,6}\s*$/gm, '') // Remove standalone markdown headers
        .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers at start of lines
        .replace(/\s+#{1,6}\s*$/gm, '') // Remove markdown headers at end of lines
        .replace(/#{3,}/g, '') // Remove any sequence of 3+ # characters anywhere
        .trim();

      steps.push({
        title: stepTitle,
        content: stepContent
      });

      lastIndex = stepEnd;
    });
  } else {
    // No step markers found - try multiple strategies to split into steps
    
    // Strategy 1: Split by double newlines (paragraphs)
    const paragraphs = solution.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 1) {
      // Split into steps by paragraphs
      paragraphs.forEach((para, idx) => {
        // Try to extract a title from the first line
        const lines = para.trim().split('\n');
        const firstLine = lines[0].trim();
        
        // Check if first line looks like a title (short, ends with colon, or is a header)
        const isTitle = firstLine.length < 100 && (firstLine.endsWith(':') || /^[A-Z][^.!?]*$/.test(firstLine));
        
        if (isTitle && lines.length > 1) {
          steps.push({
            title: firstLine.replace(/^#+\s*/, '').replace(/[:]$/, ''),
            content: lines.slice(1).join('\n').trim()
          });
        } else {
          steps.push({
            title: `Step ${idx + 1}`,
            content: para.trim()
          });
        }
      });
    } else if (paragraphs.length === 1) {
      // Strategy 2: Single paragraph - try to split by single newlines if it's long
      const singlePara = paragraphs[0];
      const lines = singlePara.split('\n').filter(l => l.trim().length > 0);
      
      if (lines.length > 3) {
        // Long content - try to group lines into logical steps
        // Look for lines that start with capital letters and are short (potential headers)
        let currentStep: string[] = [];
        let stepNum = 1;
        
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          
          // Check if this line could be a step header
          const couldBeHeader = trimmed.length < 80 && 
                               (trimmed.endsWith(':') || 
                                /^[A-Z][^.!?]{0,60}$/.test(trimmed) ||
                                /^[A-Z][^.!?]*:$/.test(trimmed));
          
          if (couldBeHeader && currentStep.length > 0 && idx > 0) {
            // Save current step and start new one
            steps.push({
              title: currentStep[0].replace(/[:]$/, '') || `Step ${stepNum}`,
              content: currentStep.slice(1).join('\n').trim() || currentStep.join('\n').trim()
            });
            currentStep = [trimmed];
            stepNum++;
          } else {
            currentStep.push(line);
          }
        });
        
        // Add the last step
        if (currentStep.length > 0) {
          const firstLine = currentStep[0].trim();
          if (firstLine.length < 80 && (firstLine.endsWith(':') || /^[A-Z][^.!?]*$/.test(firstLine))) {
            steps.push({
              title: firstLine.replace(/[:]$/, ''),
              content: currentStep.slice(1).join('\n').trim()
            });
          } else {
            steps.push({
              title: `Step ${stepNum}`,
              content: currentStep.join('\n').trim()
            });
          }
        }
        
        // If we still only have one step, try splitting by sentences
        if (steps.length === 0 || (steps.length === 1 && steps[0].content.length > 500)) {
          const newSteps: Array<{ title: string; content: string }> = [];
          const sentences = singlePara.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 20);
          
          if (sentences.length > 2) {
            // Group sentences into steps (2-3 sentences per step)
            const sentencesPerStep = Math.ceil(sentences.length / Math.max(2, Math.floor(sentences.length / 3)));
            
            for (let i = 0; i < sentences.length; i += sentencesPerStep) {
              const stepContent = sentences.slice(i, i + sentencesPerStep).join(' ').trim();
              newSteps.push({
                title: `Step ${Math.floor(i / sentencesPerStep) + 1}`,
                content: stepContent
              });
            }
          }
          
          if (newSteps.length > 0) {
            steps.length = 0;
            steps.push(...newSteps);
          }
        }
      } else {
        // Short single paragraph - treat as single step
        steps.push({
          title: 'Solution',
          content: singlePara.trim()
        });
      }
    } else {
      // No paragraphs found - try to split by single newlines
      const lines = solution.split('\n').filter(l => l.trim().length > 0);
      
      if (lines.length > 3) {
        // Long content - split into logical chunks
        let currentStep: string[] = [];
        let stepNum = 1;
        
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          
          // Check if this line starts a new step
          const startsNewStep = /^(\d+[.)]\s|[-*+]\s|•\s)/.test(trimmed) || 
                                (trimmed.length < 80 && trimmed.endsWith(':')) ||
                                (idx > 0 && trimmed.match(/^[A-Z][^.!?]{0,60}$/));
          
          if (startsNewStep && currentStep.length > 0) {
            steps.push({
              title: `Step ${stepNum}`,
              content: currentStep.join('\n').trim()
            });
            currentStep = [trimmed];
            stepNum++;
          } else {
            currentStep.push(line);
          }
        });
        
        // Add the last step
        if (currentStep.length > 0) {
          steps.push({
            title: `Step ${stepNum}`,
            content: currentStep.join('\n').trim()
          });
        }
        
        // If we didn't create multiple steps, fall back to single step
        if (steps.length === 0) {
          steps.push({
            title: 'Solution',
            content: solution
          });
        }
      } else {
        // Short content - treat as single step
        steps.push({
          title: 'Solution',
          content: solution
        });
      }
    }
  }

  // Debug: log how many steps were found
  console.log('Parsed steps:', steps.length, steps.map(s => s.title));

  // Render each step as a modern card
  return steps.map((step, index) => {
    let borderRadius = '1rem';
    if (noGaps) {
      if (index === 0 && steps.length === 1) {
        borderRadius = '0 0 1rem 1rem';
      } else if (index === 0) {
        borderRadius = '0 0 0 1rem';
      } else if (index === steps.length - 1) {
        borderRadius = '0 0 1rem 1rem';
      } else {
        borderRadius = '0';
      }
    }

    return (
      <motion.div
        key={`step-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          card-modern relative overflow-hidden
          ${noGaps && index > 0 ? 'rounded-t-none border-t-0' : ''}
          ${noGaps && index < steps.length - 1 ? 'rounded-b-none border-b-0' : ''}
        `}
        style={{
          marginBottom: noGaps ? 0 : (index < steps.length - 1 ? '0.5rem' : '0'),
          marginTop: noGaps ? 0 : 'auto',
          borderRadius: borderRadius,
        }}
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90">
              {step.title}
            </div>
            <div className="text-xs text-white/50 mt-0.5">Solution Step</div>
          </div>
        </div>
        
        <div className="text-sm text-white/80 leading-relaxed break-words prose-invert" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {renderMarkdown(step.content.trim(), codeColor)}
        </div>
      </motion.div>
    );
  });
}

