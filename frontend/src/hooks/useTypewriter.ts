import { useState, useEffect, useRef } from 'react';

interface UseTypewriterProps {
    content: string;
    speed?: number;
    onComplete?: () => void;
}

export function useTypewriter({
    content,
    speed = 15, // ms per char
    onComplete
}: UseTypewriterProps) {
    const [displayedContent, setDisplayedContent] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let currentIndex = 0;

        // Reset state when content changes significantly
        if (content !== displayedContent && !displayedContent.startsWith(content.substring(0, 10))) {
            setDisplayedContent("");
            setIsComplete(false);
            currentIndex = 0;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else if (isComplete && content === displayedContent) {
            // Already shown
            return;
        } else if (content.startsWith(displayedContent) && displayedContent.length > 0) {
            // Just appending, continue from where we are
            currentIndex = displayedContent.length;
        }

        const typeNextChar = () => {
            if (currentIndex < content.length) {
                const char = content[currentIndex];

                // Dynamic speed based on punctuation
                const isPunctuation = /[.,;!?]/.test(char);
                const dynamicSpeed = isPunctuation ? speed * 5 : speed;

                setDisplayedContent(content.slice(0, currentIndex + 1));
                currentIndex++;

                timeoutRef.current = setTimeout(typeNextChar, dynamicSpeed);
            } else {
                if (!isComplete) {
                    setIsComplete(true);
                    onComplete?.();
                }
            }
        };

        // Start typing
        if (currentIndex < content.length) {
            timeoutRef.current = setTimeout(typeNextChar, speed);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, speed]); // Removed onComplete from deps to avoid re-triggering loops if onComplete is unstable

    return { displayedContent, isComplete };
}
