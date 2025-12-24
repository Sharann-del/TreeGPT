import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import { TreeNode } from '../types';
import { renderMarkdown } from '../utils/markdown';

function ProblemNode({ data }: { data: { node: TreeNode } }) {
  const node = data.node;
  const isSelected = useStore(state => state.selectedNodeId === node.id);
  const setSelected = useStore(state => state.setSelectedNode);
  const rootId = useStore(state => state.rootId);

  const isRoot = !node.parentId;
  // Check if this is a step node (has a parent and parent is root, and title starts with "Step")
  const isStepNode = node.parentId === rootId && /^Step\s+\d+/.test(node.title);

  const statusConfig = {
    open: {
      bg: 'bg-gradient-to-br from-white/5 via-cyan-400/5 to-blue-400/5',
      border: 'border-cyan-400/40',
      badge: 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40',
      glow: ''
    },
    solving: {
      bg: 'bg-gradient-to-br from-white/8 via-blue-400/10 to-indigo-400/8',
      border: 'border-blue-400/50',
      badge: 'bg-blue-400/25 text-blue-200 border border-blue-400/50',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
    },
    solved: {
      bg: 'bg-gradient-to-br from-white/8 via-green-400/10 to-emerald-400/8',
      border: 'border-green-400/50',
      badge: 'bg-green-400/25 text-green-200 border border-green-400/50',
      glow: ''
    },
    revised: {
      bg: 'bg-gradient-to-br from-white/8 via-purple-400/10 to-violet-400/8',
      border: 'border-purple-400/50',
      badge: 'bg-purple-400/25 text-purple-200 border border-purple-400/50',
      glow: ''
    }
  };

  const config = statusConfig[node.status];
  const statusLabels = {
    open: 'Open',
    solving: 'Solving...',
    solved: 'Solved',
    revised: 'Revised'
  };

  // Different styling for step nodes
  const stepNodeBg = isStepNode 
    ? 'bg-gradient-to-br from-white/8 via-green-400/10 to-emerald-400/8'
    : config.bg;
  const stepNodeBorder = isStepNode
    ? 'border-green-400/50'
    : config.border;

  return (
    <div
      className={`group relative px-6 py-5 rounded-xl min-w-[700px] max-w-[900px] cursor-pointer transition-all duration-300 transform hover:scale-[1.01] ${
        stepNodeBg
      } ${stepNodeBorder} border-2 ${config.glow} backdrop-blur-sm ${
        isSelected ? 'ring-2 ring-cyan-400/50 shadow-2xl scale-[1.01] shadow-cyan-400/20' : 'shadow-lg hover:shadow-xl hover:shadow-cyan-400/10'
      } animate-fade-in`}
      onClick={() => setSelected(node.id)}
      style={{ width: 'auto', overflow: 'visible' }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        className="!bg-white/40 !border-2 !border-black !w-2.5 !h-2.5"
      />
      
      {/* Connection indicator */}
      {!isRoot && (
        <div className="absolute -top-1 left-8 w-0.5 h-2 bg-gradient-to-b from-cyan-400/70 to-blue-400/50" />
      )}
      
      {/* Title */}
      <div className="mb-4">
        <div className="font-semibold text-base mb-2 text-white break-words flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-400/60 rounded-full" />
          <span>{node.title}</span>
        </div>
      </div>
      
      {/* Problem text - full content with markdown rendering */}
      <div className="text-sm text-white/80 mb-4 leading-relaxed break-words" style={{ minHeight: 'auto', overflow: 'visible' }}>
        {renderMarkdown(node.problem)}
      </div>
      
      {/* Don't show solution in the problem box - steps are separate nodes */}
      
      {/* Footer with status and children count */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.badge} uppercase tracking-wider`}>
          {statusLabels[node.status]}
        </span>
        
                {node.children.length > 0 && (
                  <span className="text-xs text-purple-300/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-pulse" />
                    {node.children.length} branch{node.children.length !== 1 ? 'es' : ''}
                  </span>
                )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="!bg-white/40 !border-2 !border-black !w-2.5 !h-2.5"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  problemNode: ProblemNode
};

export default function TreeView() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const setSelected = useStore(state => state.setSelectedNode);

  const reactFlowNodes = useMemo<Node[]>(() => {
    if (!rootId) return [];
    
    const flowNodes: Node[] = [];
    const visited = new Set<string>();
        const nodeWidth = 700; // Wider to show full content
        const horizontalSpacing = nodeWidth + 150; // More space to the right for sub-problems
        const verticalSpacing = 800; // Large spacing to prevent overlap - consistent gap between boxes
    
    const buildNodes = (nodeId: string, x: number, y: number, level: number = 0): { maxY: number; maxX: number } => {
      if (visited.has(nodeId)) return { maxY: y, maxX: x };
      visited.add(nodeId);
      
      const node = nodes.get(nodeId);
      if (!node) return { maxY: y, maxX: x };
      
      flowNodes.push({
        id: nodeId,
        type: 'problemNode',
        position: { x, y },
        data: { node }
      });
      
      if (node.children.length === 0) return { maxY: y, maxX: x };
      
      const isRoot = nodeId === rootId;
      let maxY = y;
      let maxX = x;
      
      if (isRoot) {
        // Root's children (main steps) go DOWN vertically, aligned at same X
        // Use consistent spacing - position each node after previous + fixed gap
        let currentY = y + verticalSpacing;
        
        node.children.forEach((childId) => {
          const result = buildNodes(childId, x, currentY, level + 1); // Same X for alignment
          maxY = Math.max(maxY, result.maxY);
          maxX = Math.max(maxX, result.maxX);
          // Position next node: bottom of current node + fixed gap
          // Use maxY (bottom of node) + spacing for consistent gaps
          currentY = result.maxY + verticalSpacing;
        });
      } else {
        // Sub-problems go to the RIGHT, then DOWN vertically
        const childX = x + horizontalSpacing;
        let currentY = y; // Start at same Y as parent
        
        node.children.forEach((childId) => {
          const result = buildNodes(childId, childX, currentY, level + 1);
          maxY = Math.max(maxY, result.maxY);
          maxX = Math.max(maxX, result.maxX);
          // Move down for next sibling
          currentY = result.maxY + verticalSpacing;
        });
      }
      
      return { maxY, maxX };
    };
    
    buildNodes(rootId, 0, 0);
    return flowNodes;
  }, [nodes, rootId]);

  const reactFlowEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];
    
    nodes.forEach((node) => {
      node.children.forEach((childId) => {
        edges.push({
          id: `${node.id}-${childId}`,
          source: node.id,
          target: childId,
          type: 'smoothstep',
          animated: node.status === 'solving'
        });
      });
    });
    
    return edges;
  }, [nodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelected(node.id);
  }, [setSelected]);

  const createRoot = useStore(state => state.createRoot);
  const [problemInput, setProblemInput] = useState('');

  const handleCreateRoot = () => {
    if (problemInput.trim()) {
      createRoot(problemInput.trim());
      setProblemInput('');
    }
  };

  if (!rootId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in relative z-10">
          <div className="text-center mb-8">
            <p className="text-xl mb-2 text-cyan-200 font-medium">No problem tree yet</p>
            <p className="text-sm text-cyan-300/60">Create a root problem to get started</p>
          </div>
          
          <div className="bg-gradient-to-br from-white/8 via-cyan-400/5 to-blue-400/5 border-2 border-cyan-400/30 rounded-xl p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-2">New Problem</h2>
              <p className="text-xs text-cyan-300/50 uppercase tracking-wider">Enter your problem below</p>
            </div>
            <textarea
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleCreateRoot();
                }
              }}
              placeholder="Enter your problem..."
              className="w-full p-4 border-2 border-cyan-400/30 rounded-lg mb-4 resize-none text-white placeholder-cyan-300/40 bg-cyan-400/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all backdrop-blur-sm"
              rows={6}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateRoot}
                disabled={!problemInput.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400/20 to-blue-400/15 hover:from-cyan-400/25 hover:to-blue-400/20 border-2 border-cyan-400/40 text-cyan-200 hover:text-cyan-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-all duration-200 backdrop-blur-sm shadow-lg shadow-cyan-400/10"
              >
                Create
              </button>
              <button
                onClick={() => setProblemInput('')}
                disabled={!problemInput.trim()}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 rounded-lg disabled:opacity-30 transition-all duration-200 backdrop-blur-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black relative overflow-auto" style={{ scrollbarWidth: 'thin' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, includeHiddenNodes: false }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 1, stroke: 'rgba(255, 255, 255, 0.15)' },
          animated: false
        }}
        nodeOrigin={[0, 0]}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        preventScrolling={false}
      >
        <Background 
          gap={24} 
          size={0.5}
          color="rgba(255, 255, 255, 0.03)"
        />
        <Controls 
          className="!bg-black/80 !border-white/10 !backdrop-blur-md"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap 
          className="!bg-black/80 !border-white/10 !backdrop-blur-md"
          nodeColor={(node) => {
            const status = (node.data as { node: TreeNode }).node.status;
            if (status === 'solved') return '#ffffff';
            if (status === 'solving') return '#888888';
            if (status === 'revised') return '#aaaaaa';
            return '#444444';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}

