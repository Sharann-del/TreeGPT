import { create } from 'zustand';
import { TreeNode, TreeState, NodeStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState extends TreeState {
  selectedNodeId: string | null;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  addNode: (node: TreeNode) => void;
  updateNode: (id: string, updates: Partial<TreeNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  createRoot: (problem: string) => string;
  createSubProblem: (parentId: string, problem: string) => string;
  getNode: (id: string) => TreeNode | undefined;
  getAncestors: (id: string) => TreeNode[];
  getDescendants: (id: string) => string[];
  clearTree: () => void;
  exportTree: () => string;
  importTree: (data: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: new Map(),
  rootId: null,
  selectedNodeId: null,
  apiKey: null,

  setApiKey: (key) => {
    // SECURITY: API keys are stored in browser localStorage only
    // NEVER hardcode API keys in this file or commit them to Git
    // Keys stay on the user's device and are never sent to our servers
    if (key) {
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('openai_api_key');
    }
    set({ apiKey: key });
  },

  addNode: (node) => {
    const nodes = new Map(get().nodes);
    nodes.set(node.id, node);
    
    // Update parent's children array
    if (node.parentId) {
      const parent = nodes.get(node.parentId);
      if (parent) {
        const updatedParent = {
          ...parent,
          children: [...parent.children, node.id],
          updatedAt: Date.now()
        };
        nodes.set(node.parentId, updatedParent);
      }
    }
    
    set({ nodes });
  },

  updateNode: (id, updates) => {
    const nodes = new Map(get().nodes);
    const node = nodes.get(id);
    if (node) {
      nodes.set(id, { ...node, ...updates, updatedAt: Date.now() });
      set({ nodes });
    }
  },

  deleteNode: (id) => {
    const nodes = new Map(get().nodes);
    const node = nodes.get(id);
    
    if (!node) return;
    
    // Recursively delete children
    const descendants = get().getDescendants(id);
    descendants.forEach(descId => nodes.delete(descId));
    
    // Remove from parent's children
    if (node.parentId) {
      const parent = nodes.get(node.parentId);
      if (parent) {
        const updatedParent = {
          ...parent,
          children: parent.children.filter(childId => childId !== id),
          updatedAt: Date.now()
        };
        nodes.set(node.parentId, updatedParent);
      }
    }
    
    nodes.delete(id);
    
    // Clear root if deleting root
    if (get().rootId === id) {
      set({ rootId: null, selectedNodeId: null });
    }
    
    set({ nodes });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  createRoot: (problem) => {
    const id = uuidv4();
    const root: TreeNode = {
      id,
      parentId: null,
      title: 'Root Problem',
      problem,
      solution: '',
      status: 'open',
      children: [],
      context: {
        ancestorSummary: '',
        assumptions: ''
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    get().addNode(root);
    set({ rootId: id, selectedNodeId: id });
    return id;
  },

  createSubProblem: (parentId, problem) => {
    const parent = get().getNode(parentId);
    if (!parent) throw new Error('Parent node not found');
    
    const id = uuidv4();
    const ancestors = get().getAncestors(parentId);
    const ancestorSummary = ancestors
      .map(a => `${a.title}: ${a.problem}`)
      .join('\n');
    
    const subProblem: TreeNode = {
      id,
      parentId,
      title: `Sub-problem: ${problem.substring(0, 50)}...`,
      problem,
      solution: '',
      status: 'open',
      children: [],
      context: {
        ancestorSummary: `${ancestorSummary}\n${parent.title}: ${parent.problem}`,
        assumptions: parent.context.assumptions
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    get().addNode(subProblem);
    set({ selectedNodeId: id });
    return id;
  },

  getNode: (id) => get().nodes.get(id),

  getAncestors: (id) => {
    const ancestors: TreeNode[] = [];
    const nodes = get().nodes;
    let currentId: string | null = id;
    
    while (currentId) {
      const node = nodes.get(currentId);
      if (!node) break;
      
      if (node.parentId) {
        ancestors.unshift(node);
        currentId = node.parentId;
      } else {
        break;
      }
    }
    
    return ancestors;
  },

  getDescendants: (id) => {
    const descendants: string[] = [];
    const node = get().nodes.get(id);
    if (!node) return descendants;
    
    const collect = (nodeId: string) => {
      const n = get().nodes.get(nodeId);
      if (!n) return;
      n.children.forEach(childId => {
        descendants.push(childId);
        collect(childId);
      });
    };
    
    collect(id);
    return descendants;
  },

  clearTree: () => {
    set({ nodes: new Map(), rootId: null, selectedNodeId: null });
  },

  exportTree: () => {
    const state = get();
    const data = {
      rootId: state.rootId,
      nodes: Array.from(state.nodes.entries())
    };
    return JSON.stringify(data, null, 2);
  },

  importTree: (data) => {
    try {
      const parsed = JSON.parse(data);
      const nodes = new Map(parsed.nodes);
      set({
        nodes,
        rootId: parsed.rootId,
        selectedNodeId: parsed.rootId
      });
    } catch (error) {
      console.error('Failed to import tree:', error);
    }
  }
}));

// Load API key from localStorage on init
if (typeof window !== 'undefined') {
  const storedKey = localStorage.getItem('openai_api_key');
  if (storedKey) {
    useStore.getState().setApiKey(storedKey);
  }
}

