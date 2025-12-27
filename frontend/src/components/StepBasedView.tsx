import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { TreeNode } from '../types';
import { parseAndRenderSteps } from '../utils/parseSteps';
import { renderMarkdown } from '../utils/markdown';
import { ChevronLeft, ChevronRight, Play, Loader2, Sparkles, Zap } from 'lucide-react';
import { openAIService } from '../services/openai';
import { useToast } from '../utils/toast';
import ProblemInputModal from './ProblemInputModal';

interface StepWithSubProblemsProps {
  stepNode: TreeNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onCreateSubProblem: (parentId: string, side: 'left' | 'right', problem: string) => void;
}

function StepWithSubProblems({ stepNode, onSelect, isSelected, onCreateSubProblem }: StepWithSubProblemsProps) {
  const nodes = useStore(state => state.nodes);
  
  const allSubProblems = stepNode.children
    .map(childId => nodes.get(childId))
    .filter((node): node is TreeNode => {
      if (!node) return false;
      return node.parentId === stepNode.id && !/^Step\s+\d+/.test(node.title);
    });

  const leftSubProblems = allSubProblems.filter(sp => sp.context.subProblemSide === 'left');
  const rightSubProblems = allSubProblems.filter(sp => sp.context.subProblemSide === 'right' || !sp.context.subProblemSide);

  const [showSubProblemModal, setShowSubProblemModal] = useState(false);
  const [subProblemSide, setSubProblemSide] = useState<'left' | 'right'>('right');

  const handleCreateSubProblem = (side: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setSubProblemSide(side);
    setShowSubProblemModal(true);
  };

  const handleSubProblemSubmit = (problem: string) => {
    onCreateSubProblem(stepNode.id, subProblemSide, problem);
    setShowSubProblemModal(false);
  };

  return (
    <div className="relative" style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Left Sub-problems - Absolutely positioned */}
      {leftSubProblems.length > 0 && (
        <div 
          className="absolute right-full"
          style={{ 
            width: '800px',
            marginRight: '2rem',
            top: 0
          }}
        >
          {/* Horizontal connector line from step to sub-problem */}
          {leftSubProblems.length > 0 && (
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-0"
              style={{ 
                width: '2rem', 
                height: '2px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            />
          )}
          
          <div className="flex flex-col gap-4">
            {leftSubProblems.map((subProblem, idx) => (
              <motion.div
                key={subProblem.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="relative"
              >
                <SubProblemBranch
                  subProblem={subProblem}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  onCreateSubProblem={onCreateSubProblem}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Step Block - Always Centered */}
      <div 
        className="relative group"
        style={{ width: '800px', maxWidth: '100%', position: 'relative', zIndex: 10 }}
      >
        {/* Vertical connector line to next step */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-full z-0"
          style={{ 
            width: '2px', 
            height: '1rem',
            background: 'rgba(255, 255, 255, 0.2)'
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(stepNode.id)}
          className={`
            card-modern cursor-pointer relative overflow-hidden
            ${stepNode.solution ? 'mb-0 rounded-b-none' : 'mb-4'}
            ${isSelected 
              ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20' 
              : 'hover:bg-white/10'
            }
          `}
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">
                  {stepNode.title}
                </div>
                <div className="text-xs text-white/50 mt-0.5">Step</div>
              </div>
            </div>
            
            {/* Create sub-problem buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleCreateSubProblem('left', e)}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all"
                title="Create sub-problem on left"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleCreateSubProblem('right', e)}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all"
                title="Create sub-problem on right"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          <div className="text-base text-white/80 leading-relaxed break-words prose-invert" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderMarkdown(stepNode.problem, 'green')}
          </div>

          {/* Loading Animation */}
          {stepNode.status === 'solving' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-sm text-white/60 animate-pulse">Generating solution...</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Step solution boxes below - no gap */}
        {stepNode.solution && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col relative z-10" 
            style={{ 
              width: '100%',
              marginTop: 0,
              gap: 0
            }}
          >
            {parseAndRenderSteps(stepNode.solution, 'green', true)}
          </motion.div>
        )}

        {/* Sub-problem input modal */}
        <ProblemInputModal
          isOpen={showSubProblemModal}
          onClose={() => setShowSubProblemModal(false)}
          onSubmit={handleSubProblemSubmit}
          title={`Create Sub-problem (${subProblemSide} side)`}
          placeholder="Enter the sub-problem..."
        />
      </div>

      {/* Right Sub-problems - Absolutely positioned */}
      {rightSubProblems.length > 0 && (
        <div 
          className="absolute left-full"
          style={{ 
            width: '800px',
            marginLeft: '2rem',
            top: 0
          }}
        >
          {/* Horizontal connector line from step to sub-problem */}
          {rightSubProblems.length > 0 && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-0"
              style={{ 
                width: '2rem', 
                height: '2px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            />
          )}
          
          <div className="flex flex-col gap-4">
            {rightSubProblems.map((subProblem, idx) => (
              <motion.div
                key={subProblem.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="relative"
              >
                <SubProblemBranch
                  subProblem={subProblem}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  onCreateSubProblem={onCreateSubProblem}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubProblemBranchProps {
  subProblem: TreeNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onCreateSubProblem: (parentId: string, side: 'left' | 'right', problem: string) => void;
}

function SubProblemBranch({ subProblem, onSelect, isSelected, onCreateSubProblem }: SubProblemBranchProps) {
  const nodes = useStore(state => state.nodes);
  const updateNode = useStore(state => state.updateNode);
  const apiKey = useStore(state => state.apiKey);
  const { showToast } = useToast();
  const [isSolving, setIsSolving] = useState(false);
  const parent = subProblem.parentId ? nodes.get(subProblem.parentId) : null;

  // Get sub-problems for this sub-problem (nested sub-problems)
  const allSubProblems = subProblem.children
    .map(childId => nodes.get(childId))
    .filter((node): node is TreeNode => {
      if (!node) return false;
      return node.parentId === subProblem.id && !/^Step\s+\d+/.test(node.title);
    });

  const leftSubProblems = allSubProblems.filter(sp => sp.context.subProblemSide === 'left');
  const rightSubProblems = allSubProblems.filter(sp => sp.context.subProblemSide === 'right' || !sp.context.subProblemSide);

  const [showSubProblemModal, setShowSubProblemModal] = useState(false);
  const [subProblemSide, setSubProblemSide] = useState<'left' | 'right'>('right');

  const handleCreateSubProblem = (side: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setSubProblemSide(side);
    setShowSubProblemModal(true);
  };

  const handleSubProblemSubmit = (problem: string) => {
    onCreateSubProblem(subProblem.id, subProblemSide, problem);
    setShowSubProblemModal(false);
  };

  const handleSolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey || !openAIService.isInitialized()) {
      showToast('Please set your OpenAI API key first', 'warning');
      return;
    }

    setIsSolving(true);
    updateNode(subProblem.id, { status: 'solving' });

    try {
      if (parent) {
        const context = {
          parentProblem: parent.problem,
          parentSolution: parent.solution,
          ancestorSummary: subProblem.context.ancestorSummary,
          currentStep: subProblem.problem
        };
        const solution = await openAIService.solveSubProblem(subProblem.problem, context);
        updateNode(subProblem.id, {
          solution: solution,
          status: 'solved'
        });
        showToast('Sub-problem solved!', 'success');
      }
    } catch (error) {
      console.error('Error solving sub-problem:', error);
      showToast('Error solving sub-problem. Check your API key and try again.', 'error');
      updateNode(subProblem.id, { status: 'open' });
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="relative" style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Left nested sub-problems */}
      {leftSubProblems.length > 0 && (
        <div 
          className="absolute right-full"
          style={{ 
            width: '800px',
            marginRight: '2rem',
            top: 0
          }}
        >
          {leftSubProblems.length > 0 && (
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-0"
              style={{ 
                width: '2rem', 
                height: '2px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            />
          )}
          
          <div className="flex flex-col gap-4">
            {leftSubProblems.map((nestedSubProblem, idx) => (
              <motion.div
                key={nestedSubProblem.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="relative"
              >
                <SubProblemBranch
                  subProblem={nestedSubProblem}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  onCreateSubProblem={onCreateSubProblem}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-problem block - centered */}
      <div className="relative" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Vertical connector line for sub-problem steps */}
        {subProblem.solution && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-full z-0"
            style={{ 
              width: '2px', 
              height: '1rem',
              background: 'rgba(255, 255, 255, 0.2)'
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(subProblem.id)}
          className={`
            card-modern cursor-pointer relative overflow-hidden
            ${subProblem.solution ? 'mb-0 rounded-b-none' : 'mb-4'}
            ${isSelected 
              ? 'ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-rose-500/20' 
              : 'hover:bg-white/10'
            }
          `}
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-rose-500" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">
                  {subProblem.title}
                </div>
                <div className="text-xs text-white/50 mt-0.5">Sub-problem</div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {subProblem.status === 'open' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleSolve(e)}
                  disabled={isSolving}
                  className="p-2 rounded-xl glass hover:bg-white/10 text-cyan-300 hover:text-cyan-200 transition-all disabled:opacity-50"
                  title="Solve Sub-problem"
                >
                  {isSolving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </motion.button>
              )}
              {/* Create nested sub-problem buttons */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleCreateSubProblem('left', e)}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all"
                title="Create sub-problem on left"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleCreateSubProblem('right', e)}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all"
                title="Create sub-problem on right"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          <div className="text-sm text-white/80 leading-relaxed break-words prose-invert" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderMarkdown(subProblem.problem, 'blue')}
          </div>

          {/* Loading Animation */}
          {subProblem.status === 'solving' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                <span className="text-sm text-white/60 animate-pulse">Generating solution...</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sub-problem solution - no gap */}
        {subProblem.solution && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col relative z-10" 
            style={{ 
              width: '100%',
              marginTop: 0,
              gap: 0,
              paddingTop: 0,
              marginBottom: 0
            }}
          >
            {parseAndRenderSteps(subProblem.solution, 'green', true)}
          </motion.div>
        )}

        {/* Sub-problem input modal */}
        <ProblemInputModal
          isOpen={showSubProblemModal}
          onClose={() => setShowSubProblemModal(false)}
          onSubmit={handleSubProblemSubmit}
          title={`Create Sub-problem (${subProblemSide} side)`}
          placeholder="Enter the sub-problem..."
        />
      </div>

      {/* Right nested sub-problems */}
      {rightSubProblems.length > 0 && (
        <div 
          className="absolute left-full"
          style={{ 
            width: '800px',
            marginLeft: '2rem',
            top: 0
          }}
        >
          {rightSubProblems.length > 0 && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-0"
              style={{ 
                width: '2rem', 
                height: '2px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            />
          )}
          
          <div className="flex flex-col gap-4">
            {rightSubProblems.map((nestedSubProblem, idx) => (
              <motion.div
                key={nestedSubProblem.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="relative"
              >
                <SubProblemBranch
                  subProblem={nestedSubProblem}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  onCreateSubProblem={onCreateSubProblem}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepBasedView() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const createSubProblem = useStore(state => state.createSubProblem);
  const updateNode = useStore(state => state.updateNode);
  const apiKey = useStore(state => state.apiKey);
  const { showToast } = useToast();
  const [isSolving, setIsSolving] = useState(false);

  if (!rootId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-lg text-white/60 mb-2">No conversation selected</p>
          <p className="text-sm text-white/40">Create a new conversation from the sidebar</p>
        </motion.div>
      </div>
    );
  }

  const root = nodes.get(rootId);
  if (!root) return null;

  const stepNodes = root.children
    .map(childId => nodes.get(childId))
    .filter((node): node is TreeNode => {
      if (!node) return false;
      return /^Step\s+\d+/.test(node.title) || node.parentId === rootId;
    })
    .sort((a, b) => {
      const aMatch = a.title.match(/Step\s+(\d+)/);
      const bMatch = b.title.match(/Step\s+(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return 0;
    });

  const handleCreateSubProblem = (parentId: string, side: 'left' | 'right', problem: string) => {
    createSubProblem(parentId, problem, side);
  };

  const handleSolveRoot = async () => {
    if (!apiKey || !openAIService.isInitialized()) {
      showToast('Please set your OpenAI API key first', 'warning');
      return;
    }

    setIsSolving(true);
    updateNode(rootId, { status: 'solving' });

    try {
      const solution = await openAIService.solveRootProblem(root.problem);
      updateNode(rootId, {
        solution: solution,
        status: 'solved'
      });
      showToast('Root problem solved!', 'success');
    } catch (error) {
      console.error('Error solving root:', error);
      showToast('Error solving problem. Check your API key and try again.', 'error');
      updateNode(rootId, { status: 'open' });
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-auto">
      <div className="p-8 flex flex-col items-center" style={{ width: '100%', minWidth: '2400px' }}>
        {/* Root Problem Block - Centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-8"
          style={{ width: '800px', maxWidth: '100%' }}
        >
          {/* Vertical connector line */}
          {stepNodes.length > 0 && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-full z-0"
              style={{ 
                width: '2px', 
                height: '1rem',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            />
          )}

          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedNode(rootId)}
            className={`
              card-modern cursor-pointer relative overflow-hidden
              ${selectedNodeId === rootId 
                ? 'ring-2 ring-red-500/50 shadow-lg shadow-red-500/20 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-rose-500/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-rose-500" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {root.title}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">Main Problem</div>
                </div>
              </div>
              
              {/* Solve button */}
              {root.status === 'open' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSolveRoot();
                  }}
                  disabled={isSolving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                  title="Solve Problem"
                >
                  {isSolving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Solving...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Solve</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
            
            <div className="text-base text-white/80 leading-relaxed break-words prose-invert" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {renderMarkdown(root.problem, 'blue')}
            </div>

            {/* Loading Animation */}
            {root.status === 'solving' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                  <span className="text-sm text-white/60 animate-pulse">Generating solution...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Solution Steps - Centered Tree layout */}
        <AnimatePresence mode="popLayout">
          {stepNodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 items-center" 
              style={{ width: '100%' }}
            >
              {stepNodes.map((stepNode, idx) => (
                <motion.div
                  key={stepNode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-start justify-center" 
                  style={{ width: '100%' }}
                >
                  <StepWithSubProblems
                    stepNode={stepNode}
                    onSelect={setSelectedNode}
                    isSelected={selectedNodeId === stepNode.id}
                    onCreateSubProblem={(parentId, side, problem) => handleCreateSubProblem(parentId, side, problem)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Root Solution Steps if solved and no step nodes */}
        {root.solution && stepNodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6" 
            style={{ width: '800px', maxWidth: '100%' }}
          >
            {parseAndRenderSteps(root.solution, 'green')}
          </motion.div>
        )}
      </div>
    </div>
  );
}
