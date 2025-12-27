
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Settings,
    Keyboard,
    FileText,
    Zap,
    Download,
    Trash2
} from "lucide-react";
import { useStore } from "../store";

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const clearTree = useStore(state => state.clearTree);
    const exportTree = useStore(state => state.exportTree);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleClear = () => {
        if (confirm('Clear the entire tree?')) {
            clearTree();
            setOpen(false);
        }
    };

    const handleExport = () => {
        const data = exportTree();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treegpt - ${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
    };

    // Custom styles for cmkd are needed since it's unstyled by default
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-xl relative"
                    >
                        <Command className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-premium">
                            <div className="flex items-center border-b border-white/5 px-4 py-3">
                                <Search className="w-5 h-5 text-white/40 mr-3" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="w-full bg-transparent text-white placeholder:text-white/20 outline-none text-base font-light"
                                />
                                <div className="flex gap-1">
                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">ESC</span>
                                </div>
                            </div>

                            <Command.List className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <Command.Empty className="py-6 text-center text-sm text-white/30">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Actions" className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2 px-2 mt-2">
                                    <CommandItem onSelect={() => { window.location.reload() }}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Project
                                    </CommandItem>
                                    <CommandItem onSelect={handleExport}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export Tree
                                    </CommandItem>
                                    <CommandItem onSelect={handleClear}>
                                        <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                                        <span className="text-red-400">Clear Workspace</span>
                                    </CommandItem>
                                </Command.Group>

                                <Command.Group heading="Navigation" className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2 px-2 mt-4">
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Go to Dashboard
                                    </CommandItem>
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </CommandItem>
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Focus Mode
                                    </CommandItem>
                                </Command.Group>

                                <Command.Group heading="System" className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2 px-2 mt-4">
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <Keyboard className="w-4 h-4 mr-2" />
                                        Keyboard Shortcuts
                                    </CommandItem>
                                </Command.Group>

                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm text-white/70 aria-selected:bg-purple-500/20 aria-selected:text-white cursor-pointer transition-colors"
        >
            {children}
        </Command.Item>
    );
}
