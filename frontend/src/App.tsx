import React from 'react';
import Header from './components/Header';
import TreeList from './components/TreeList';
import TreeView from './components/TreeView';
import NodeInspector from './components/NodeInspector';

function App() {
  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tree List */}
        <div className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-sm">
          <TreeList />
        </div>
        
        {/* Center: Tree View */}
        <div className="flex-1 border-r border-white/10 relative">
          <TreeView />
        </div>
        
        {/* Right: Chat View */}
        <div className="w-96 bg-black/30 backdrop-blur-sm">
          <NodeInspector />
        </div>
      </div>
    </div>
  );
}

export default App;

