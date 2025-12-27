import { useState } from 'react';
import { useStore } from '../store';
import { openAIService } from '../services/openai';
import { parseAndRenderSteps } from '../utils/parseSteps';
import { renderMarkdown } from '../utils/markdown';
import { Play, Plus, ArrowUp, Loader2 } from 'lucide-react';
import { useToast } from '../utils/toast';
import { motion } from 'framer-motion';

export default function NodeInspector() {
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const nodes = useStore(state => state.nodes);
  const apiKey = useStore(state => state.apiKey);
  const updateNode = useStore(state => state.updateNode);
  const createSubProblem = useStore(state => state.createSubProblem);
  const { showToast } = useToast();
  const [isSolving, setIsSolving] = useState(false);
  const [subProblemInput, setSubProblemInput] = useState('');

  if (!selectedNodeId) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Select a node to view details</p>
      </div>
    );
  }

  const node = nodes.get(selectedNodeId);
  if (!node) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Node not found</p>
      </div>
    );
  }

  const isRoot = !node.parentId;
  const parent = node.parentId ? nodes.get(node.parentId) : null;

  const handleSolve = async () => {
    if (!apiKey || !openAIService.isInitialized()) {
      showToast('Please set your OpenAI API key first', 'warning');
      return;
    }

    setIsSolving(true);
    updateNode(node.id, { status: 'solving' });

    try {
      if (isRoot) {
        const solution = await openAIService.solveRootProblem(node.problem);
        updateNode(node.id, {
          solution: solution,
          status: 'solved'
        });
        showToast('Root problem solved!', 'success');
      } else if (parent) {
        const context = {
          parentProblem: parent.problem,
          parentSolution: parent.solution,
          ancestorSummary: node.context.ancestorSummary,
          currentStep: node.problem
        };
        const solution = await openAIService.solveSubProblem(node.problem, context);
        updateNode(node.id, {
          solution: solution,
          status: 'solved'
        });
        showToast('Sub-problem solved!', 'success');
      }
    } catch (error) {
      console.error('Error solving problem:', error);
      showToast('Error solving problem. Check your API key and try again.', 'error');
      updateNode(node.id, { status: 'open' });
    } finally {
      setIsSolving(false);
    }
  };

  const handleCreateSubProblem = () => {
    if (!subProblemInput.trim()) {
      showToast('Please enter a sub-problem', 'warning');
      return;
    }

    createSubProblem(node.id, subProblemInput.trim());
    setSubProblemInput('');
    showToast('Sub-problem created', 'success');
  };

  const handleApplyToParent = async () => {
    if (!node.parentId || !apiKey) {
      showToast('This node has no parent or API key not set', 'warning');
      return;
    }

    const parentNode = nodes.get(node.parentId);
    if (!parentNode || !node.solution) {
      showToast('Parent not found or no solution to apply', 'warning');
      return;
    }

    setIsSolving(true);
    updateNode(parentNode.id, { status: 'solving' });

    try {
      const context = {
        parentProblem: parentNode.problem,
        parentSolution: parentNode.solution || '',
        ancestorSummary: node.context.ancestorSummary,
        currentStep: node.problem
      };

      const updatedSolution = await openAIService.updateParentSolution(
        parentNode.solution || parentNode.problem,
        node.solution,
        context
      );

      updateNode(parentNode.id, {
        solution: updatedSolution,
        status: 'revised',
        updatedAt: Date.now()
      });
      showToast('Solution applied to parent', 'success');
    } catch (error) {
      console.error('Error updating parent:', error);
      showToast('Error updating parent solution', 'error');
      updateNode(parentNode.id, { status: 'solved' });
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Node Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
            node.status === 'open' ? 'bg-white/10 text-white/60' :
            node.status === 'solving' ? 'bg-blue-500/20 text-blue-300' :
            node.status === 'solved' ? 'bg-green-500/20 text-green-300' :
            'bg-purple-500/20 text-purple-300'
          }`}>
            {node.status}
          </div>
          {isRoot && (
            <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300">Root</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{node.title}</h2>
        {node.children.length > 0 && (
          <p className="text-sm text-white/40">{node.children.length} child{node.children.length !== 1 ? 'ren' : ''}</p>
        )}
      </div>

      {/* Problem Section */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wider">Problem</h3>
        <div className="glass-panel rounded-xl p-4 text-white/80 leading-relaxed">
          {renderMarkdown(node.problem)}
        </div>
      </div>

      {/* Solution Section */}
      {node.solution && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Solution</h3>
          <div className="flex flex-col" style={{ gap: '0.5rem' }}>
            {parseAndRenderSteps(node.solution, 'green')}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        {node.status === 'open' && (
          <button
            onClick={handleSolve}
            disabled={isSolving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSolving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Solve Problem
              </>
            )}
          </button>
        )}

        {!isRoot && node.solution && (
          <button
            onClick={handleApplyToParent}
            disabled={isSolving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSolving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <ArrowUp className="w-5 h-5" />
                Apply to Parent
              </>
            )}
          </button>
        )}

        <div className="space-y-2">
          <input
            type="text"
            value={subProblemInput}
            onChange={(e) => setSubProblemInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateSubProblem();
              }
            }}
            placeholder="Create a sub-problem..."
            className="w-full glass-panel rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button
            onClick={handleCreateSubProblem}
            className="w-full bg-white/10 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sub-problem
          </button>
        </div>
      </div>
    </div>
  );
}

