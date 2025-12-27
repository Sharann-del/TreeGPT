import React from 'react';

export function renderMarkdown(text: string, codeColor: 'blue' | 'green' | 'emerald' = 'blue'): React.ReactNode[] {
  if (!text) return [<div key="empty" className="text-white/40 italic">(empty)</div>];

  // Clean up any remaining markdown header artifacts
  text = text
    .replace(/^#{1,6}\s*$/gm, '') // Remove standalone markdown headers
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers at start of lines
    .replace(/\s+#{1,6}\s*$/gm, '') // Remove markdown headers at end of lines
    .replace(/#{3,}/g, '') // Remove any sequence of 3+ # characters anywhere in text
    .trim();

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-200 border-green-400/40 bg-green-400/10';
      case 'emerald': return 'text-emerald-200 border-emerald-400/40 bg-emerald-400/10';
      default: return 'text-cyan-200 border-cyan-400/40 bg-cyan-400/10';
    }
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Handle code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        if (codeBlockContent.length > 0) {
          elements.push(
            <div key={`code-${lineIndex}`} className={`my-3 p-4 rounded-lg border-2 backdrop-blur-sm font-mono text-sm font-semibold shadow-lg ${getColorClass(codeColor)}`}>
              <code className="whitespace-pre-wrap block">{codeBlockContent.join('\n')}</code>
            </div>
          );
        }
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Handle empty lines
    if (trimmed === '') {
      elements.push(<div key={`empty-${lineIndex}`} className="mb-2">&nbsp;</div>);
      return;
    }

    // COMMAND DETECTION
    const prevLine = lineIndex > 0 ? lines[lineIndex - 1].trim() : '';
    const prevLineIsInstruction = prevLine.endsWith(':') &&
      /(?:running|run|execute|type|typing|enter|command|by\s+running|by\s+typing|by\s+executing|by\s+entering)/i.test(prevLine);

    const commandWordPattern = /^\s*(brew|npm|pip|git|curl|wget|sudo|\.\/|chmod|cd|mkdir|echo|cat|grep|find|ls|pwd|export|alias|source|open|cp|mv|rm|touch|tar|zip|unzip|ssh|scp|rsync|docker|kubectl|python|node|ruby|java|go|rustc|cargo|make|cmake|gcc|clang|neofetch|yabai)\s+/i;
    const startsWithCommand = commandWordPattern.test(trimmed);

    const looksLikeCommand = trimmed.includes('/') ||
      trimmed.includes('$') ||
      trimmed.includes('"') ||
      trimmed.includes("'") ||
      trimmed.includes('(') ||
      /^[a-zA-Z0-9_\.\/-]+\s+[a-zA-Z0-9_\/\.-]+/.test(trimmed);

    const isAbsolutePath = /^\/[a-zA-Z0-9\/\.-]+/.test(trimmed);

    const instructionWordsPattern = /(?:install|update|run|execute|type|enter|use|running|executing|by\s+running|by\s+typing|by\s+executing|reload|verify|once|homebrew|yabai|neofetch|optional|to\s+run|every\s+time)/i;
    const hasInstructionWords = instructionWordsPattern.test(trimmed);

    const shouldHighlightAsCommand = (prevLineIsInstruction || startsWithCommand || looksLikeCommand || isAbsolutePath) &&
      trimmed.length > 0 &&
      trimmed.length < 300 &&
      !trimmed.endsWith(':') &&
      !trimmed.endsWith('.') &&
      (!hasInstructionWords || startsWithCommand);

    if (shouldHighlightAsCommand) {
      elements.push(
        <div key={`cmd-${lineIndex}`} className={`my-3 p-4 rounded-lg border-2 backdrop-blur-sm font-mono text-sm font-semibold shadow-lg ${getColorClass(codeColor)}`}>
          <code className="whitespace-pre-wrap block">{trimmed}</code>
        </div>
      );
      return;
    }

    // Handle headers
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const content = match[2];
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        elements.push(
          <Tag key={`h-${lineIndex}`} className={`mb-2 font-bold text-white ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'}`}>
            {renderInlineMarkdown(content, codeColor)}
          </Tag>
        );
        return;
      }
    }

    // Handle lists
    if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={`list-${lineIndex}`} className="mb-2 ml-4">
          <span className="text-white/50 mr-2">•</span>
          <span>{renderInlineMarkdown(content, codeColor)}</span>
        </div>
      );
      return;
    }

    // Regular text
    elements.push(
      <div key={`p-${lineIndex}`} className="mb-2 leading-relaxed whitespace-pre-wrap">
        {renderInlineMarkdown(line, codeColor)}
      </div>
    );
  });

  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <div key="code-final" className={`my-3 p-4 rounded-lg border-2 backdrop-blur-sm font-mono text-sm font-semibold shadow-lg ${getColorClass(codeColor)}`}>
        <code className="whitespace-pre-wrap block">{codeBlockContent.join('\n')}</code>
      </div>
    );
  }

  if (elements.length === 0) {
    return [<div key="fallback" className="text-white/90 whitespace-pre-wrap">{text}</div>];
  }

  return elements;
}

function renderInlineMarkdown(text: string, codeColor: 'blue' | 'green' | 'emerald' = 'blue'): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-200 border-green-400/40 bg-green-400/10';
      case 'emerald': return 'text-emerald-200 border-emerald-400/40 bg-emerald-400/10';
      default: return 'text-cyan-200 border-cyan-400/40 bg-cyan-400/10';
    }
  };

  // Patterns for markdown
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, render: (_match: string, content: string) => <strong key={`bold-${currentIndex++}`} className="font-bold text-white">{content}</strong> },
    { regex: /\*(.+?)\*/g, render: (_match: string, content: string) => <em key={`italic-${currentIndex++}`} className="italic text-white/90">{content}</em> },
    {
      regex: /`(.+?)`/g, render: (_match: string, content: string) => {
        return <code key={`code-${currentIndex++}`} className={`px-2 py-1 rounded font-mono text-sm border-2 font-semibold ${getColorClass(codeColor)}`}>{content}</code>;
      }
    },
    { regex: /\[(.+?)\]\((.+?)\)/g, render: (_match: string, text: string, url: string) => <a key={`link-${currentIndex++}`} href={url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white underline transition-colors">{text}</a> },
  ];

  let lastIndex = 0;
  const matches: Array<{ index: number; length: number; render: React.ReactNode }> = [];

  // Find all matches
  patterns.forEach(({ regex, render }) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      // For link pattern [text](url), pass all 3 args; for others, pass match and content
      let renderResult: React.ReactNode;
      if (match.length >= 3 && match[2]) {
        // Link pattern: match[0] = full match, match[1] = text, match[2] = url
        renderResult = render(match[0], match[1] || '', match[2] || '');
      } else {
        // Other patterns: match[0] = full match, match[1] = content
        renderResult = render(match[0], match[1] || '', '');
      }
      matches.push({
        index: match.index,
        length: match[0].length,
        render: renderResult
      });
    }
  });

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Remove overlapping matches (keep first one)
  const nonOverlapping: typeof matches = [];
  matches.forEach(match => {
    const overlaps = nonOverlapping.some(existing =>
      (match.index >= existing.index && match.index < existing.index + existing.length) ||
      (existing.index >= match.index && existing.index < match.index + match.length)
    );
    if (!overlaps) {
      nonOverlapping.push(match);
    }
  });

  // Build result
  nonOverlapping.forEach((match) => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${currentIndex++}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    // Add match
    parts.push(match.render);
    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-final-${currentIndex++}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [text];
}
