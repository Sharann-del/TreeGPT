import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Plus, GitBranch, ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

// Problem Header Component (Red Box)
export const ProblemHeaderNode = ({ data }: NodeProps) => {
    const { title } = data;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[300px] bg-red-600/90 border-2 border-red-400/50 rounded-xl p-4 shadow-xl backdrop-blur-md text-white relative group"
        >
            <Handle type="target" position={Position.Top} className="opacity-0" />

            <div className="font-bold text-lg mb-1">Problem</div>
            <div className="text-sm opacity-90 line-clamp-3">
                {title}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-red-400" />
        </motion.div>
    );
};

// Step Component (Green Box)
export const StepNode = ({ data, id }: NodeProps) => {
    const { title, index, problemId } = data;
    const createSubProblem = useStore(state => state.createSubProblem);
    const [showActions, setShowActions] = useState(false);

    // Parse Step ID from node ID if needed, or pass it in data
    // data.id is usually the node id in ReactFlow, but we might have custom data

    const handleAddSubProblem = (side: 'left' | 'right') => {
        // We need the parent Problem ID.
        // In our store, "createSubProblem" takes (parentId, problemString, side, stepId).
        // The "parentId" argument in `createSubProblem` is the PARENT NODE ID (the Problem Node).
        // But we are at a STEP.
        // The STEP is a child of the Problem.
        // Wait, Store `createSubProblem`: (parentId, problem, side, stepId)
        // If Step is a distinct Node in Store, then `stepId` is the Node ID of the step.
        // If we want to attach to the Step, we pass the Step ID?
        // Let's check Store: `parentId` is used to find ancestors.
        // If Step is a real Node, we can pass Step ID as `parentId`?
        // The Store `createSubProblem` tries `get().getNode(parentId)`.
        // So if "Step" is a Node in `nodes` map, we pass that ID.

        // Prompting user for problem text?
        const problemText = prompt(`Enter ${side} sub-problem:`);
        if (problemText) {
            // We pass `problemId` as parentId (Logic: The Subproblem belongs to the Problem Tree conceptually),
            // BUT we pass `id` (Step ID) as the `stepId` argument to link it specifically.
            createSubProblem(problemId, problemText, side, id);
        }
        setShowActions(false);
    };

    return (
        <motion.div
            layoutId={id}
            onClick={() => setShowActions(!showActions)}
            className="w-[300px] bg-emerald-600/90 border-2 border-emerald-400/50 rounded-xl p-4 shadow-lg backdrop-blur-md text-white relative cursor-pointer hover:bg-emerald-600 transition-colors"
        >
            <Handle type="target" position={Position.Top} className="!bg-emerald-400" />

            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs opacity-60 uppercase tracking-wider">Step {index + 1}</span>
                <GitBranch className="w-4 h-4 opacity-40" />
            </div>

            <div className="text-sm font-medium leading-relaxed">
                {title}
            </div>

            {showActions && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-16 left-0 right-0 flex justify-center gap-2 z-50"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAddSubProblem('left'); }}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xl"
                    >
                        <ArrowLeft className="w-3 h-3" /> Left Sub
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAddSubProblem('right'); }}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xl"
                    >
                        Right Sub <ArrowRight className="w-3 h-3" />
                    </button>
                </motion.div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />

            {/* Side Handles for connecting to sub-problems visual lines? */}
            {/* We use standard edges, so we might need source handles on Left/Right? */}
            <Handle type="source" position={Position.Left} id="left" className="!bg-transparent !border-none" style={{ left: -5 }} />
            <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-none" style={{ right: -5 }} />
        </motion.div>
    );
};
