import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store';
import { openAIService } from '../services/openai';
import { TreeNode } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { parseAndRenderSteps } from '../utils/parseSteps';
import { parseStepsFromSolution } from '../utils/parseStepsToNodes';

export default function NodeInspector() {
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const node = useStore(state => 
    selectedNodeId ? state.getNode(selectedNodeId) : null
  );
  const updateNode = useStore(state => state.updateNode);
  const createSubProblem = useStore(state => state.createSubProblem);
  const rootId = useStore(state => state.rootId);
  const apiKey = useStore(state => state.apiKey);

  const [subProblemText, setSubProblemText] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  if (!node) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)]" />
        <div className="text-center animate-fade-in relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
          <p className="text-white/50 text-sm">Select a node to view details</p>
        </div>
      </div>
    );
  }

  const handleSolve = async () => {
    if (!apiKey || !openAIService.isInitialized()) {
      alert('Please set your OpenAI API key first');
      return;
    }

    setIsSolving(true);
    updateNode(node.id, { status: 'solving' });

    try {
      if (node.id === rootId && !node.solution) {
        // Solve root problem - get raw solution
        const solution = await openAIService.solveRootProblem(node.problem);
        
        // Parse steps and create child nodes for each step
        const steps = parseStepsFromSolution(solution);
        const store = useStore.getState();
        
        steps.forEach((step, index) => {
          const stepNode: TreeNode = {
            id: uuidv4(),
            parentId: node.id,
            title: step.title,
            problem: step.content,
            solution: '',
            status: 'open',
            children: [],
            context: {
              ancestorSummary: node.problem,
              assumptions: node.context.assumptions,
              stepNumber: index + 1
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          store.addNode(stepNode); // addNode automatically adds to parent's children
        });
        
        updateNode(node.id, {
          solution: solution,
          status: 'solved'
        });
      } else if (node.parentId) {
        // Solve sub-problem - get raw solution
        const parent = useStore.getState().getNode(node.parentId);
        if (parent) {
          const context = {
            parentProblem: parent.problem,
            parentSolution: parent.solution,
            ancestorSummary: node.context.ancestorSummary,
            currentStep: node.problem
          };

          const solution = await openAIService.solveSubProblem(
            node.problem,
            context
          );

          // Parse steps and create child nodes for each step
          const steps = parseStepsFromSolution(solution);
          const store = useStore.getState();
          
          steps.forEach((step, index) => {
            const stepNode: TreeNode = {
              id: uuidv4(),
              parentId: node.id,
              title: step.title,
              problem: step.content,
              solution: '',
              status: 'open',
              children: [],
              context: {
                ancestorSummary: `${node.context.ancestorSummary}\n${node.problem}`,
                assumptions: node.context.assumptions,
                stepNumber: index + 1
              },
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            store.addNode(stepNode); // addNode automatically adds to parent's children
          });

          updateNode(node.id, {
            solution: solution,
            status: 'solved'
          });
        }
      }
    } catch (error) {
      console.error('Error solving problem:', error);
      alert('Error solving problem. Check your API key and try again.');
      updateNode(node.id, { status: 'open' });
    } finally {
      setIsSolving(false);
    }
  };

  const handleCreateSubProblem = async () => {
    if (!subProblemText.trim()) {
      alert('Please enter a sub-problem');
      return;
    }

    setIsCreatingSub(true);
    try {
      createSubProblem(node.id, subProblemText.trim());
      setSubProblemText('');
    } catch (error) {
      console.error('Error creating sub-problem:', error);
      alert('Error creating sub-problem');
    } finally {
      setIsCreatingSub(false);
    }
  };

  const handleApplyToParent = async () => {
    if (!node.parentId || !apiKey) {
      alert('This node has no parent or API key not set');
      return;
    }

    const parent = useStore.getState().getNode(node.parentId);
    if (!parent) return;

    setIsSolving(true);
    updateNode(parent.id, { status: 'solving' });

    try {
      if (!node.solution) {
        alert('Sub-problem has no solution to apply');
        updateNode(parent.id, { status: 'solved' });
        return;
      }

      const context = {
        parentProblem: parent.problem,
        parentSolution: parent.solution || '',
        ancestorSummary: node.context.ancestorSummary,
        currentStep: node.problem
      };

      // Update parent solution with sub-problem solution
      const updatedSolution = await openAIService.updateParentSolution(
        parent.solution || parent.problem,
        node.solution,
        context
      );

      updateNode(parent.id, {
        solution: updatedSolution,
        status: 'revised',
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating parent:', error);
      alert('Error updating parent steps');
      updateNode(parent.id, { status: 'solved' });
    } finally {
      setIsSolving(false);
    }
  };


  const isRoot = !node.parentId;
  const statusConfig = {
    open: { badge: 'bg-white/10 text-white/60', border: 'border-white/20' },
    solving: { badge: 'bg-white/15 text-white/80', border: 'border-white/30' },
    solved: { badge: 'bg-white/20 text-white', border: 'border-white/40' },
    revised: { badge: 'bg-white/15 text-white/90', border: 'border-white/35' }
  };
  const config = statusConfig[node.status];

  return (
    <div className="h-full flex flex-col bg-black/50 backdrop-blur-sm border-l border-white/10 animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-white mb-2">{node.title}</h2>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.badge}`}>
              {node.status}
            </span>
            {node.children.length > 0 && (
              <span className="text-xs text-white/50">
                {node.children.length} branch{node.children.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
        {/* Problem message (user-like) */}
        <div className="flex gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 text-sm text-cyan-300 font-semibold">
            Q
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-cyan-300/60 mb-2 px-1 uppercase tracking-wider">Problem</div>
            <div className={`p-5 rounded-2xl rounded-tl-sm bg-white/5 border-l-4 border-cyan-400/40 border-t border-r border-b border-white/20 backdrop-blur-sm shadow-xl`}>
              <div className="text-sm leading-relaxed text-white/90">
                {renderMarkdown(node.problem)}
              </div>
            </div>
          </div>
        </div>

        {/* Solution message (AI-like) - displayed as separate step boxes */}
        {node.solution && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-10 h-10 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0 text-sm text-green-300 font-semibold">
                A
              </div>
              <div className="text-xs text-green-300/60 uppercase tracking-wider">Solution</div>
            </div>
            {parseAndRenderSteps(node.solution, 'green')}
          </div>
        )}

        {/* Loading state */}
        {node.status === 'solving' && (
          <div className="flex gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-blue-400/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-blue-400/60 border-t-blue-300 rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <div className="p-5 rounded-2xl rounded-tl-sm bg-blue-400/5 border border-blue-400/30 backdrop-blur-sm shadow-xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context (collapsed by default) */}
        {node.context.ancestorSummary && (
          <details className="group">
            <summary className="text-xs text-purple-300/70 cursor-pointer hover:text-purple-200 mb-2 px-1 transition-colors">
              View context
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-gradient-to-br from-purple-400/10 to-violet-400/5 border border-purple-400/30 backdrop-blur-sm">
              <p className="text-xs text-white/70 leading-relaxed">
                {node.context.ancestorSummary}
              </p>
            </div>
          </details>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-sm space-y-3">
        {!node.solution && node.status !== 'solving' && (
          <button
            onClick={handleSolve}
            disabled={!apiKey || isSolving}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-400/15 to-indigo-400/10 hover:from-blue-400/20 hover:to-indigo-400/15 border border-blue-400/40 text-blue-200 hover:text-blue-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium backdrop-blur-sm shadow-lg shadow-blue-400/10"
          >
            {isSolving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-400/60 border-t-transparent rounded-full animate-spin" />
                Solving...
              </span>
            ) : (
              'Solve with GPT'
            )}
          </button>
        )}

        {node.parentId && node.status === 'solved' && (
          <button
            onClick={handleApplyToParent}
            disabled={isSolving}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-400/15 to-violet-400/10 hover:from-purple-400/20 hover:to-violet-400/15 border border-purple-400/40 text-purple-200 hover:text-purple-100 rounded-lg disabled:opacity-30 transition-all duration-200 font-medium backdrop-blur-sm shadow-lg shadow-purple-400/10"
          >
            Apply Solution to Parent
          </button>
        )}

        <div className="pt-4 border-t border-cyan-400/20">
          <h4 className="font-semibold text-sm mb-3 text-cyan-200 uppercase tracking-wider">Create Sub-problem</h4>
          <textarea
            value={subProblemText}
            onChange={(e) => setSubProblemText(e.target.value)}
            placeholder="Enter a sub-problem for this step..."
            className="w-full p-4 border border-cyan-400/30 rounded-lg text-sm mb-3 resize-none bg-cyan-400/5 text-white placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all backdrop-blur-sm"
            rows={3}
          />
          <button
            onClick={handleCreateSubProblem}
            disabled={isCreatingSub || !subProblemText.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400/15 to-blue-400/10 hover:from-cyan-400/20 hover:to-blue-400/15 border border-cyan-400/40 text-cyan-200 hover:text-cyan-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium backdrop-blur-sm shadow-lg shadow-cyan-400/10"
          >
            {isCreatingSub ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-cyan-400/60 border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Sub-problem'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

