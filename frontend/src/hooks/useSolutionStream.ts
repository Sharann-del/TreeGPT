import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { openAIService } from '../services/openai';
import { parseStepsFromSolution } from '../utils/parseStepsToNodes';

export function useSolutionStream() {
    const nodes = useStore(state => state.nodes);
    const updateNode = useStore(state => state.updateNode);
    const createSubProblem = useStore(state => state.createSubProblem);
    const apiKey = useStore(state => state.apiKey);

    // We need to track which nodes are currently being "streamed" (simulated)
    // to avoid re-triggering or duplicate steps.
    const streamingNodesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        nodes.forEach(node => {
            // 1. Trigger Solve if 'open' and it's a root (or we want auto-solve for everything?)
            // The user said "enter should generate", which usually implies Root. 
            // Let's rely on the creation logic setting it to 'solving' or we watch 'open' root?
            // Actually, typically we set status='solving' when we start.
            // But let's say we check if it's 'solving' and has NO solution yet.

            if (node.status === 'solving' && !streamingNodesRef.current.has(node.id)) {
                streamingNodesRef.current.add(node.id);

                const processSolution = async () => {
                    try {
                        // Fetch full solution (simulating stream for now as per plan)
                        let solution = '';

                        if (node.parentId) {
                            const parent = nodes.get(node.parentId);
                            if (parent) {
                                const context = {
                                    parentProblem: parent.problem,
                                    parentSolution: parent.solution,
                                    ancestorSummary: node.context.ancestorSummary,
                                    currentStep: node.problem
                                };
                                solution = await openAIService.solveSubProblem(node.problem, context);
                            }
                        } else {
                            solution = await openAIService.solveRootProblem(node.problem);
                        }

                        // Parse steps
                        const steps = parseStepsFromSolution(solution);

                        // Sequentially add steps to the tree
                        // We'll update the node's solution field at the end, 
                        // but we create child nodes progressively.

                        for (let i = 0; i < steps.length; i++) {
                            const step = steps[i];

                            // Delay for fluid animation effect
                            await new Promise(resolve => setTimeout(resolve, 800)); // 800ms per step "thinking" time

                            const childId = createSubProblem(node.id, step.content, undefined);
                            updateNode(childId, {
                                title: step.title,
                                status: 'open' // They start open
                            });
                        }

                        // Mark parent as solved
                        updateNode(node.id, { solution, status: 'solved' });

                    } catch (error) {
                        console.error("Error generating solution:", error);
                        updateNode(node.id, { status: 'open' }); // Revert
                    } finally {
                        streamingNodesRef.current.delete(node.id);
                    }
                };

                processSolution();
            }
        });
    }, [nodes, apiKey, updateNode, createSubProblem]);
}
