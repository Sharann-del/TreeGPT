import { TreeNode } from '../types';
import { ProblemNode, Step } from './layoutEngine';

// Constants for Dimensions
const BOX_WIDTH = 300; // Standard width for all boxes
const HEADER_HEIGHT = 80;
const STEP_HEIGHT = 100; // Height of each step

export function buildLayoutTree(
    nodes: Map<string, TreeNode>,
    rootId: string | null
): ProblemNode | null {
    if (!rootId) return null;
    const rootNode = nodes.get(rootId);
    if (!rootNode) return null;

    return buildProblemNode(rootNode, nodes);
}

function buildProblemNode(
    node: TreeNode,
    allNodes: Map<string, TreeNode>,
    parentStepId?: string
): ProblemNode {
    const problemNode: ProblemNode = {
        id: node.id,
        parentStepId,
        side: node.context.subProblemSide || 'right', // Default to right if unspecified
        headerHeight: HEADER_HEIGHT,
        boxWidth: BOX_WIDTH,
        steps: [],
        children: [],
        layout: { x: 0, y: 0, width: 0, height: 0 }, // Placeholder
        subtreeWidth: 0,
        leftSubtreeWidth: 0,
        rightSubtreeWidth: 0
    };

    // Find Steps and Sub-problems
    // In the Store, a Problem Node has children which are primarily Steps.
    // But strictly, we need to iterate children and classify.

    if (node.children && node.children.length > 0) {
        node.children.forEach(childId => {
            const childNode = allNodes.get(childId);
            if (!childNode) return;

            // Identify if it's a Step or a direct Sub-Problem (unlikely but possible)
            // We assume Steps have "Step" in title or are just standard children of a Problem
            // For now, let's treat ALL direct children of a Problem as Steps, 
            // UNLESS they are explicitly marked as `subProblemSide`? 
            // Actually, standard flow: Problem -> [Steps]. Steps -> [SubProblems].

            // Let's check if the child ITSELF is a sub-problem (has a problem statement)?
            // Steps usually have `problem` text too though.
            // `TreeView.tsx` used: `const isStepNode = node.parentId === rootId && /^Step\s+\d+/.test(node.title);`
            // We should generalize `parentId === currentProblemId`.

            const isStep = /^Step\s+\d+/.test(childNode.title);

            if (isStep) {
                // Create Step
                const stepIndex = parseInt(childNode.title.match(/Step\s+(\d+)/)?.[1] || '0');

                const step: Step = {
                    id: childNode.id,
                    index: stepIndex,
                    height: STEP_HEIGHT
                };
                problemNode.steps.push(step);

                // Check for Sub-problems attached to this Step
                if (childNode.children && childNode.children.length > 0) {
                    childNode.children.forEach(subProbId => {
                        const subProbNode = allNodes.get(subProbId);
                        if (subProbNode) {
                            const subProblem = buildProblemNode(subProbNode, allNodes, step.id);
                            problemNode.children.push(subProblem);
                        }
                    });
                }
            } else {
                // If it's NOT a step, maybe it's a direct sub-problem? 
                // e.g. User added a sub-problem to the Problem Header directly?
                // Logic: Treat as a generic child attached to "Header" (no step)?
                // For now, we ignore or warn. The prompt emphasizes "Step -> Sub-problem".
                // Or maybe we treat it as Step 0?
            }
        });
    }

    // Sort steps by index
    problemNode.steps.sort((a, b) => a.index - b.index);

    return problemNode;
}
