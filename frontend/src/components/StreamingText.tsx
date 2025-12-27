import { renderMarkdown } from "../utils/markdown";
import { useTypewriter } from "../hooks/useTypewriter";

interface StreamingTextProps {
    content: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
    renderAsMarkdown?: boolean;
}

export function StreamingText({
    content,
    speed = 15, // ms per char
    className = "",
    onComplete,
    renderAsMarkdown = true
}: StreamingTextProps) {
    const { displayedContent, isComplete } = useTypewriter({
        content,
        speed,
        onComplete
    });

    return (
        <div className={className}>
            {renderAsMarkdown ? renderMarkdown(displayedContent) : displayedContent}
            {!isComplete && (
                <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-zinc-400 animate-pulse" />
            )}
        </div>
    );
}
