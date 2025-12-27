import { useStore } from '../store';
import { parseAndRenderSteps } from '../utils/parseSteps';
import { renderMarkdown } from '../utils/markdown';
import { motion } from 'framer-motion';

export default function SolutionChatView() {
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const nodes = useStore(state => state.nodes);

  if (!selectedNodeId) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 p-8">
        <p className="text-center">Select a node to view its solution</p>
      </div>
    );
  }

  const node = nodes.get(selectedNodeId);
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 p-8">
        <p className="text-center">Node not found</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto p-6">
        {/* Problem Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Problem</div>
          <div className="text-white/90 leading-relaxed">
            {renderMarkdown(node.problem)}
          </div>
        </motion.div>

        {/* Solution Section - Linear Chat View */}
        {node.solution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="text-xs text-white/40 mb-4 uppercase tracking-wider">Solution</div>
            {/* Render solution as linear steps - like ChatGPT */}
            <div className="space-y-0">
              {parseAndRenderSteps(node.solution, 'green')}
            </div>
          </motion.div>
        )}

        {!node.solution && (
          <div className="text-white/40 text-sm italic">
            No solution yet. Click "Solve Problem" in the node inspector.
          </div>
        )}
      </div>
    </div>
  );
}

