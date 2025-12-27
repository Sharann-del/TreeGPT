/**
 * Dynamic Tree Layout Engine
 * 
 * Implements a recursive tree layout algorithm for problem-solving trees:
 * - Main problem has vertical stack of steps (trunk)
 * - Steps can spawn left/right sub-problems
 * - Sub-problems also have vertical stacks
 * - Layout ensures no overlaps and proper spacing
 */

export interface StepLayout {
  id: string;
  index: number;
  title: string;
  content: string;
  height: number;
  y: number; // Absolute Y position within the problem
}

export interface ProblemLayout {
  id: string;
  title: string;
  problem: string;
  x: number; // Center X of the problem trunk
  y: number; // Top Y of the problem header
  width: number; // Width of the problem box
  headerHeight: number;
  steps: StepLayout[];
  children: ProblemLayout[];
  parentStepId?: string; // Which step spawned this sub-problem
  side?: 'left' | 'right'; // Which side this sub-problem is on
  subtreeWidth: number; // Total width including all descendants
  leftSubtreeWidth: number; // Width of left subtree
  rightSubtreeWidth: number; // Width of right subtree
}

// Configuration constants
const CONFIG = {
  BOX_WIDTH: 400, // Width of problem/step boxes
  HEADER_HEIGHT: 100, // Height of problem header
  STEP_HEIGHT: 150, // Base height of each step box
  HORIZONTAL_GAP: 120, // Gap between subtrees
  VERTICAL_GAP: 0, // No gap between steps (they stack)
  CONNECTOR_LENGTH: 60, // Length of horizontal connector from step to sub-problem
};

/**
 * Calculate the height of a step based on its content
 */
function calculateStepHeight(content: string): number {
  const baseHeight = CONFIG.STEP_HEIGHT;
  const lines = content.split('\n').length;
  const estimatedHeight = baseHeight + (lines - 1) * 20;
  return Math.max(baseHeight, estimatedHeight);
}

/**
 * Pass 1: Calculate subtree widths recursively
 * 
 * For each node:
 * - Calculate widths of left and right subtrees
 * - subtreeWidth = max(ownWidth, leftWidth + gap + rightWidth)
 */
function calculateSubtreeWidths(node: ProblemLayout): void {
  // First, recursively calculate children widths
  node.children.forEach(child => {
    calculateSubtreeWidths(child);
  });

  // Calculate left and right subtree widths
  let leftWidth = 0;
  let rightWidth = 0;

  node.children.forEach(child => {
    if (child.side === 'left') {
      leftWidth = Math.max(leftWidth, child.subtreeWidth);
    } else if (child.side === 'right') {
      rightWidth = Math.max(rightWidth, child.subtreeWidth);
    }
  });

  // If we have children, we need space for them plus gaps
  if (leftWidth > 0 || rightWidth > 0) {
    const totalChildrenWidth = leftWidth + (leftWidth > 0 ? CONFIG.HORIZONTAL_GAP : 0) +
                               rightWidth + (rightWidth > 0 ? CONFIG.HORIZONTAL_GAP : 0);
    node.subtreeWidth = Math.max(node.width, totalChildrenWidth);
  } else {
    node.subtreeWidth = node.width;
  }

  node.leftSubtreeWidth = leftWidth;
  node.rightSubtreeWidth = rightWidth;
}

/**
 * Pass 2: Assign X and Y positions
 * 
 * The trunk (main problem) is centered at x=0.
 * When a sub-problem is added, the entire parent branch shifts.
 */
function assignPositions(
  node: ProblemLayout,
  trunkX: number, // X position of the trunk center
  topY: number // Top Y position
): void {
  // Set the problem header position
  node.x = trunkX;
  node.y = topY;

  // Calculate Y positions for steps (no gaps between them)
  let currentStepY = topY + node.headerHeight;
  node.steps.forEach(step => {
    step.y = currentStepY;
    currentStepY += step.height;
  });

  // Position children (sub-problems)
  // Left children go to the left, right children to the right
  // They are positioned at the Y of their parent step

  // Process left children
  const leftChildren = node.children.filter(c => c.side === 'left');
  leftChildren.sort((a, b) => {
    const stepA = node.steps.findIndex(s => s.id === a.parentStepId);
    const stepB = node.steps.findIndex(s => s.id === b.parentStepId);
    return stepA - stepB;
  });

  let leftOffset = trunkX - (node.width / 2) - CONFIG.HORIZONTAL_GAP;
  leftChildren.forEach(child => {
    // Find the step that spawned this child
    const parentStep = node.steps.find(s => s.id === child.parentStepId);
    if (!parentStep) return;

    // Position child: its right edge should be at leftOffset
    // Child's trunk center = leftOffset - (child.subtreeWidth / 2) + (child.width / 2)
    // Actually, we want the child's trunk to be positioned such that:
    // - The rightmost extent of the child's subtree is at leftOffset
    const childTrunkX = leftOffset - child.rightSubtreeWidth - (child.width / 2);

    // Y position is at the step that spawned it
    const childY = parentStep.y;

    assignPositions(child, childTrunkX, childY);

    // Move leftOffset further left for next child
    leftOffset = childTrunkX - child.leftSubtreeWidth - CONFIG.HORIZONTAL_GAP;
  });

  // Process right children
  const rightChildren = node.children.filter(c => c.side === 'right');
  rightChildren.sort((a, b) => {
    const stepA = node.steps.findIndex(s => s.id === a.parentStepId);
    const stepB = node.steps.findIndex(s => s.id === b.parentStepId);
    return stepA - stepB;
  });

  let rightOffset = trunkX + (node.width / 2) + CONFIG.HORIZONTAL_GAP;
  rightChildren.forEach(child => {
    // Find the step that spawned this child
    const parentStep = node.steps.find(s => s.id === child.parentStepId);
    if (!parentStep) return;

    // Position child: its left edge should be at rightOffset
    // Child's trunk center = rightOffset + child.leftSubtreeWidth + (child.width / 2)
    const childTrunkX = rightOffset + child.leftSubtreeWidth + (child.width / 2);

    // Y position is at the step that spawned it
    const childY = parentStep.y;

    assignPositions(child, childTrunkX, childY);

    // Move rightOffset further right for next child
    rightOffset = childTrunkX + child.rightSubtreeWidth + CONFIG.HORIZONTAL_GAP;
  });
}

/**
 * Main layout calculation function
 */
export function calculateLayout(root: ProblemLayout): ProblemLayout {
  // Pass 1: Calculate subtree widths
  calculateSubtreeWidths(root);

  // Pass 2: Assign positions
  // Root starts at x=0 (center), y=0 (top)
  assignPositions(root, 0, 0);

  return root;
}

/**
 * Build a ProblemLayout from TreeNode data
 * 
 * The data structure is:
 * - Problem node has children which are Step nodes (titles like "Step 1", "Step 2")
 * - Step nodes have children which are Sub-problem nodes (with subProblemSide set)
 * - The solution text is stored in the problem node's solution field
 */
export function buildProblemLayout(
  nodeId: string,
  nodes: Map<string, any>,
  parentStepId?: string,
  side?: 'left' | 'right'
): ProblemLayout | null {
  const node = nodes.get(nodeId);
  if (!node) return null;

  // Get step nodes (children with "Step" in title)
  const stepNodes: Array<{ id: string; title: string; content: string; index: number }> = [];
  if (node.children && node.children.length > 0) {
    node.children.forEach((childId: string) => {
      const childNode = nodes.get(childId);
      if (!childNode) return;

      // Check if it's a step node (has "Step" in title or is a direct child)
      const isStep = /^Step\s+\d+/.test(childNode.title) || 
                     (childNode.parentId === nodeId && !childNode.context?.subProblemSide);
      
      if (isStep) {
        // Extract step number from title
        const stepMatch = childNode.title.match(/Step\s+(\d+)/);
        const stepIndex = stepMatch ? parseInt(stepMatch[1]) : stepNodes.length + 1;
        
        // Get content from the step node's problem field or solution
        const stepContent = childNode.problem || childNode.solution || '';
        
        stepNodes.push({
          id: childId,
          title: childNode.title,
          content: stepContent,
          index: stepIndex
        });
      }
    });
  }

  // If no step nodes found but we have a solution, parse steps from solution text
  if (stepNodes.length === 0 && node.solution) {
    const parsedSteps = parseStepsFromSolution(node.solution);
    parsedSteps.forEach((step, index) => {
      stepNodes.push({
        id: `${nodeId}-step-${index}`,
        title: step.title,
        content: step.content,
        index: index + 1
      });
    });
  }

  // Sort steps by index
  stepNodes.sort((a, b) => a.index - b.index);

  // Build StepLayout array
  const steps: StepLayout[] = stepNodes.map(stepNode => ({
    id: stepNode.id,
    index: stepNode.index,
    title: stepNode.title,
    content: stepNode.content,
    height: calculateStepHeight(stepNode.content),
    y: 0 // Will be calculated in assignPositions
  }));

  // Build children (sub-problems)
  // Sub-problems are children of step nodes
  const children: ProblemLayout[] = [];
  
  stepNodes.forEach(stepNode => {
    const stepNodeData = nodes.get(stepNode.id);
    if (stepNodeData && stepNodeData.children) {
      stepNodeData.children.forEach((childId: string) => {
        const childNode = nodes.get(childId);
        if (!childNode) return;

        // Check if this is a sub-problem (has subProblemSide set)
        // OR if it's a child of a step and not itself a step
        const isSubProblem = childNode.context?.subProblemSide !== undefined ||
                            (!/^Step\s+\d+/.test(childNode.title) && childNode.parentId === stepNode.id);

        if (isSubProblem) {
          const childSide = childNode.context?.subProblemSide || 'right';
          const childLayout = buildProblemLayout(
            childId,
            nodes,
            stepNode.id, // This step spawned the sub-problem
            childSide
          );
          if (childLayout) {
            children.push(childLayout);
          }
        }
      });
    }
  });

  const layout: ProblemLayout = {
    id: nodeId,
    title: node.title || 'Problem',
    problem: node.problem || '',
    x: 0,
    y: 0,
    width: CONFIG.BOX_WIDTH,
    headerHeight: CONFIG.HEADER_HEIGHT,
    steps,
    children,
    parentStepId,
    side,
    subtreeWidth: 0,
    leftSubtreeWidth: 0,
    rightSubtreeWidth: 0
  };

  return layout;
}

/**
 * Parse steps from solution text
 */
function parseStepsFromSolution(solution: string): Array<{ title: string; content: string }> {
  if (!solution) return [];

  const steps: Array<{ title: string; content: string }> = [];
  
  // Split by step markers
  const stepPattern = /(Step\s+\d+[:\s])/gi;
  const matches = [...solution.matchAll(stepPattern)];
  
  if (matches.length > 0) {
    let lastIndex = 0;
    matches.forEach((match, index) => {
      if (match.index === undefined) return;
      
      // Content before first step
      if (match.index > lastIndex && index === 0) {
        const beforeContent = solution.substring(lastIndex, match.index).trim();
        if (beforeContent) {
          steps.push({
            title: 'Solution',
            content: beforeContent
          });
        }
      }
      
      // Extract step
      const stepLine = solution.substring(match.index).split('\n')[0];
      const titleMatch = stepLine.match(/Step\s+(\d+)[:\s]+\s*(.*)$/i);
      const stepTitle = titleMatch 
        ? (titleMatch[2] ? `Step ${titleMatch[1]}: ${titleMatch[2].trim()}` : `Step ${titleMatch[1]}`)
        : stepLine.trim();
      
      const stepStart = match.index;
      const stepEnd = index < matches.length - 1 && matches[index + 1].index !== undefined
        ? matches[index + 1].index!
        : solution.length;
      
      let stepContent = solution.substring(stepStart, stepEnd)
        .split('\n')
        .slice(1)
        .join('\n')
        .trim();
      
      // Clean markdown
      stepContent = stepContent
        .replace(/^#{1,6}\s*$/gm, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\s+#{1,6}\s*$/gm, '')
        .replace(/#{3,}/g, '')
        .trim();
      
      steps.push({
        title: stepTitle,
        content: stepContent
      });
      
      lastIndex = stepEnd;
    });
  } else {
    // No step markers - treat as single step
    steps.push({
      title: 'Solution',
      content: solution
    });
  }
  
  return steps;
}

