export type NodeStatus = 'open' | 'solving' | 'solved' | 'revised';

export interface TreeNode {
  id: string;
  parentId: string | null;
  title: string;
  problem: string;
  solution: string;
  status: NodeStatus;
  children: string[];
  context: {
    ancestorSummary: string;
    assumptions: string;
    stepNumber?: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface TreeState {
  nodes: Map<string, TreeNode>;
  rootId: string | null;
}

export interface PromptContext {
  parentProblem?: string;
  parentSolution?: string;
  ancestorSummary: string;
  currentStep?: string;
}

