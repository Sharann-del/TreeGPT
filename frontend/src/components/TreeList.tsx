import React from 'react';
import { useStore } from '../store';
import { TreeNode } from '../types';

export default function TreeList() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);

  const buildTreeList = (nodeId: string, level: number = 0): React.ReactNode => {
    const node = nodes.get(nodeId);
    if (!node) return null;

    const isSelected = selectedNodeId === nodeId;
    const hasChildren = node.children.length > 0;

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-r from-cyan-400/15 to-blue-400/10 border border-cyan-400/40 shadow-lg shadow-cyan-400/10'
              : 'hover:bg-gradient-to-r hover:from-cyan-400/5 hover:to-blue-400/5 border border-transparent hover:border-cyan-400/20'
          }`}
          onClick={() => setSelectedNode(nodeId)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            isSelected ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-white/30 group-hover:bg-cyan-400/60'
          }`} />
          
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate transition-colors ${
              isSelected ? 'text-white' : 'text-white/70 group-hover:text-white/90'
            }`}>
              {node.title}
            </div>
            <div className={`text-xs truncate mt-0.5 ${
              isSelected ? 'text-white/60' : 'text-white/40 group-hover:text-white/50'
            }`}>
              {node.problem.substring(0, 50)}...
            </div>
          </div>

          {hasChildren && (
            <div className={`text-xs px-2 py-0.5 rounded-full transition-all ${
              isSelected ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-white/10 text-white/50 group-hover:bg-cyan-400/15 group-hover:text-cyan-300'
            }`}>
              {node.children.length}
            </div>
          )}

          <div className={`w-1 h-6 rounded-full transition-all ${
            isSelected ? 'bg-gradient-to-b from-cyan-400/60 to-blue-400/40' : 'bg-transparent group-hover:bg-cyan-400/20'
          }`} />
        </div>

        {hasChildren && (
          <div className="ml-2 border-l border-cyan-400/20">
            {node.children.map(childId => buildTreeList(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!rootId) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/5 border border-cyan-400/30 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
          </div>
          <p className="text-cyan-300/60 text-sm">No problem tree yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
          Problem Tree
        </h2>
        {buildTreeList(rootId)}
      </div>
    </div>
  );
}

