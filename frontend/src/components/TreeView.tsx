import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import { ProblemHeaderNode, StepNode } from './NodeComponents';
import { buildLayoutTree } from '../utils/treeAdapter';
import { calculateTreeLayout, ProblemNode, Step } from '../utils/layoutEngine';

const nodeTypes: NodeTypes = {
  problemHeader: ProblemHeaderNode,
  stepNode: StepNode
};

export default function TreeView() {
  const nodesMap = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Compute Layout whenever store changes
  const layoutRoot = useMemo(() => {
    if (!rootId) return null;
    const tree = buildLayoutTree(nodesMap, rootId);
    if (!tree) return null;
    console.log("Calculated Tree Data (Before Layout):", JSON.parse(JSON.stringify(tree)));
    const layout = calculateTreeLayout(tree);
    console.log("Calculated Tree Layout:", JSON.parse(JSON.stringify(layout)));
    return layout;
  }, [nodesMap, rootId]);

  // Convert Layout to ReactFlow Elements
  useEffect(() => {
    if (!layoutRoot) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const traverse = (node: ProblemNode) => {
      // 1. Add Problem Header Node
      const headerId = `header-${node.id}`;
      flowNodes.push({
        id: headerId,
        type: 'problemHeader',
        position: { x: node.layout.x, y: node.layout.y },
        data: {
          title: nodesMap.get(node.id)?.title || 'Problem',
          id: node.id
        },
        draggable: false,
      });

      let currentY = node.layout.y + node.headerHeight;

      // 2. Add Steps
      let previousStepId: string | null = null;
      let previousSourceHandle = 'bottom'; // Header bottom

      node.steps.forEach((step, index) => {
        const stepNodeId = `step-${step.id}`;

        // Add Step Node
        flowNodes.push({
          id: stepNodeId,
          type: 'stepNode',
          position: { x: node.layout.x, y: currentY },
          data: {
            title: nodesMap.get(step.id)?.title || `Step ${index + 1}`,
            index: step.index,
            problemId: node.id,
            id: step.id
          },
          draggable: false,
        });

        // Edge from Previous (Header or Step) to Current Step
        const sourceId = index === 0 ? headerId : `step-${node.steps[index - 1].id}`;

        flowEdges.push({
          id: `e-${sourceId}-${stepNodeId}`,
          source: sourceId,
          target: stepNodeId,
          type: 'smoothstep',
          style: { stroke: '#10b981', strokeWidth: 2 }
        });

        currentY += step.height;
        previousStepId = step.id;
      });

      // 3. Process Sub-problems
      node.children.forEach(child => {
        // Recurse first
        traverse(child);

        // Add Connector Edge: Step -> SubProblem Header
        const parentStepId = child.parentStepId;
        if (parentStepId) {
          const sourceNodeId = `step-${parentStepId}`;
          const targetNodeId = `header-${child.id}`;

          // Determine handles based on side
          const sourceHandle = child.side === 'left' ? 'left' : 'right';
          const targetHandle = 'top'; // Header Top

          flowEdges.push({
            id: `e-${sourceNodeId}-${targetNodeId}`,
            source: sourceNodeId,
            target: targetNodeId,
            sourceHandle: sourceHandle,
            // Header node uses default target handle (top)
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#fff', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#fff',
            },
          });
        }
      });
    };

    traverse(layoutRoot);

    setNodes(flowNodes);
    setEdges(flowEdges);

  }, [layoutRoot, nodesMap, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-black relative">
      {/* Force re-render of ReactFlow logic when root changes slightly? No, nodes update handles it. */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 1000 }} // Smooth initial fit
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={40} size={1} color="rgba(255, 255, 255, 0.05)" />
        <Controls showInteractive={false} className="!bg-zinc-900 !border-white/10" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'problemHeader') return '#dc2626';
            if (n.type === 'stepNode') return '#059669';
            return '#333';
          }}
          className="!bg-zinc-900 !border-white/10"
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
