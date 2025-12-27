import { useMemo } from 'react';
import { renderMarkdown } from '../utils/markdown';
import { useTypewriter } from '../hooks/useTypewriter';
import { motion } from 'framer-motion';

interface StepRendererProps {
    content: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
    renderAsMarkdown?: boolean;
}

interface Step {
    id: number;
    title: string;
    content: string;
}

export function StepRenderer({
    content,
    speed = 15, // ms per char
    className = "",
    onComplete,
    renderAsMarkdown = true
}: StepRendererProps) {
    const { displayedContent, isComplete } = useTypewriter({
        content,
        speed,
        onComplete
    });

    const steps = useMemo(() => {
        // Regex to find "Step X: Title" pattern
        // We look for "Step \d+:" at the start of the string or preceded by a newline
        const stepRegex = /(^|\n)Step\s+(\d+):([^\n]*)([\s\S]*?)(?=(?:\nStep\s+\d+:|$))/g;

        const parsedSteps: Step[] = [];
        let match;


        // Check if the content starts with a step or if it's just regular text
        const startsWithStep = /^\s*Step\s+\d+:/.test(displayedContent);

        if (!startsWithStep) {
            // If it doesn't look like steps, treat as one block
            return null;
        }

        while ((match = stepRegex.exec(displayedContent)) !== null) {
            const stepNum = parseInt(match[2]);
            const title = match[3].trim();
            const stepContent = match[4].trim();

            parsedSteps.push({
                id: stepNum,
                title: title || `Step ${stepNum}`,
                content: stepContent
            });

        }

        return parsedSteps.length > 0 ? parsedSteps : null;
    }, [displayedContent]);

    if (!steps) {
        // Fallback to standard rendering if not in step format
        return (
            <div className={className}>
                {renderAsMarkdown ? renderMarkdown(displayedContent) : displayedContent}
                {!isComplete && (
                    <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-zinc-400 animate-pulse" />
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-white/5 bg-white/5 overflow-hidden"
                    >
                        <div className="bg-white/5 border-b border-white/5 px-4 py-2 flex items-center gap-2">
                            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Step {step.id}
                            </span>
                            <h4 className="font-medium text-white/90 text-sm">{step.title}</h4>
                        </div>
                        <div className="p-4 prose prose-invert prose-sm max-w-none text-white/70">
                            {renderAsMarkdown ? renderMarkdown(step.content) : step.content}
                            {isLast && !isComplete && (
                                <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-zinc-400 animate-pulse" />
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
