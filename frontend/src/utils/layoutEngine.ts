
export interface LayoutDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Step {
    id: string;
    index: number;
    height: number; // For variable step heights
}

export interface ProblemNode {
    id: string;
    parentStepId?: string; // ID of the step that spawned this node
    side?: 'left' | 'right';

    // Content dimensions
    headerHeight: number;
    boxWidth: number;

    steps: Step[];
    children: ProblemNode[]; // Sub-problems

    // Computed Layout
    layout: LayoutDimensions;
    subtreeWidth: number;
    leftSubtreeWidth: number;
    rightSubtreeWidth: number;
}

// Configuration
const CONFIG = {
    GAP_X: 100, // Horizontal gap between subtrees
    STEP_GAP_Y: 0, // No vertical gaps inside a problem
};

/**
 * Main function to compute the entire tree layout
 */
export function calculateTreeLayout(root: ProblemNode): ProblemNode {
    // Pass 1: Measure Widths
    measureSubtree(root);

    // Pass 2: Assign Positions
    // Root starts at x=0
    assignPositions(root, 0, 0);

    return root;
}

/**
 * Pass 1: Recursively compute subtree widths
 * 
 * subtreeWidth = max(
 *   ownWidth,
 *   leftWidth + gap + rightWidth
 * )
 */
function measureSubtree(node: ProblemNode): void {
    // 1. Measure children first
    let leftWidth = 0;
    let rightWidth = 0;

    for (const child of node.children) {
        measureSubtree(child);

        if (child.side === 'left') {
            leftWidth = Math.max(leftWidth, child.subtreeWidth);
        } else if (child.side === 'right') {
            rightWidth = Math.max(rightWidth, child.subtreeWidth);
        }
    }

    // Store for Pass 2
    node.leftSubtreeWidth = leftWidth;
    node.rightSubtreeWidth = rightWidth;

    // 2. Compute own subtree width
    // If we have children on both sides, the width covers the span from left extreme to right extreme
    // centered around this node.
    // Actually, the user formula is simpler: "leftWidth + gap + rightWidth" (roughly)

    // Refined Logic based on "Trunk is center":
    // We need enough space on the left and right.
    // Total Width required = leftSpace + ownWidth + rightSpace
    // Wait, the "subtreeWidth" is usually just the bounding box width.
    // But for the recursive calculation, we care about how much space children take.

    // Let's interpret "subtreeWidth" as the total horizontal span.
    // However, since we align to center (x=0 relative to parent), we technically care about
    // "max extent left" and "max extent right".

    // User Rule: "subtreeWidth = max(ownWidth, leftWidth + gap + rightWidth)"
    // This implies we sum specific children widths.
    // BUT, multiple children can hang off different steps on the SAME side.
    // We need the MAX width of any "stack" of children on the left, and MAX on the right.
    // No, actually, standard tree layout usually accumulates width if they are siblings.
    // BUT here, sub-problems are spawned from specific steps. They might overlap vertically if we aren't careful.
    // User Rule: "If left nodes overflow, expand canvas".
    // User Rule: "Adding a sub-problem causes The ENTIRE parent branch to shift".

    // Let's assume for now that children on the same side at different steps DO NOT overlap horizontally
    // because they are vertically separated? NO, they could overlap if the top one is wide.
    // Actually, standard "Mind Map" or "Org Chart" logic applies here.
    // If Step 1 has a Left Child, and Step 2 has a Left Child.
    // These two Left Children should be aligned such that they don't collide.
    // For the "Trunk" logic:
    // The User says: "Total Width".

    // Implementation detail: We will simply take the MAX width of all children on the left side
    // plus MAX width of all children on the right side?
    // User said: "leftWidth = sum of all left child subtree widths".
    // SUM implies they are placed side-by-side or effectively push the boundary?
    // Actually, if they are at different vertical steps, they technically *could* share X space, 
    // but to keep the "Vertical Column" look clean and simple, we typically stack their "widths" conceptually
    // or align them all to a "Level".

    // However, the rule "leftWidth = sum of all left child subtree widths" suggests strict accumulation.
    // Let's stick to the user's explicit formula:
    // leftWidth = sum(child.subtreeWidth) for all left children.

    // Realistically, to prevent collisions, we usually treat the "Left Block" as one giant container.

    const totalLeftChildrenWidth = node.children
        .filter(c => c.side === 'left')
        .reduce((sum, c) => sum + c.subtreeWidth + CONFIG.GAP_X, 0)
    // Remove one gap if we have items? Or just sum.
    // Let's be precise: width + gap + width + gap...
    // If 1 child: width.
    // If 2 children: width1 + gap + width2.

    const totalRightChildrenWidth = node.children
        .filter(c => c.side === 'right')
        .reduce((sum, c) => sum + c.subtreeWidth + CONFIG.GAP_X, 0);

    // Correct gap logic (remove trailing gap)
    const finalLeftWidth = totalLeftChildrenWidth > 0 ? totalLeftChildrenWidth - CONFIG.GAP_X : 0;
    const finalRightWidth = totalRightChildrenWidth > 0 ? totalRightChildrenWidth - CONFIG.GAP_X : 0;

    // We store these specific sums because we pack children horizontally? 
    // Wait, usually children of a vertical list are distinct sub-branches.
    // If Step1 has LeftChild A, and Step2 has LeftChild B.
    // Should A and B be stacked vertically (share X) or stacked horizontally (pushed X)?
    // User Image 1 shows "sub prob 1" and "sub prob 2" (one left, one right).
    // User Image 2 shows "sub prob 1" (left) and "sub prob 2" (RIGHT).
    // AND "sub prob 2" has "sub prob 2 sub prob 1" (left).

    // The crucial question: Do multiple Left sub-problems from the SAME trunk stack vertically or horizontally?
    // "Sub-problem: Have their OWN vertical stack".
    // If I have Step 1 -> Left1, and Step 5 -> Left2.
    // If Left1 is huge, Left2 needs to be placed such that it doesn't overlap?
    // Or do we push the WHOLE trunk to clear the widest Left child?
    // The "Sum" rule in "leftWidth = sum(...)" implies we treat them as adding up width-wise, 
    // which is the safest way to guarantee no overlap (stacking them horizontally outwards or ensuring the "reserved space" covers all).

    // Re-reading user rule:
    // "leftWidth = sum of all left child subtree widths"
    // This explicitly answers strict summation (Horizontal stacking or preventing Overlap by assuming worst case).
    // Let's use Sum.

    node.leftSubtreeWidth = finalLeftWidth;
    node.rightSubtreeWidth = finalRightWidth;

    node.subtreeWidth = Math.max(
        node.boxWidth,
        node.leftSubtreeWidth + node.boxWidth + node.rightSubtreeWidth + (node.leftSubtreeWidth ? CONFIG.GAP_X : 0) + (node.rightSubtreeWidth ? CONFIG.GAP_X : 0)
    );
}

/**
 * Pass 2: Assign Positions
 * 
 * Trunk x = 0
 * Left subtrees get NEGATIVE offsets
 * Right subtrees get POSITIVE offsets
 */
function assignPositions(node: ProblemNode, x: number, y: number): void {
    node.layout = {
        x: x,
        y: y,
        width: node.boxWidth,
        height: node.headerHeight + node.steps.reduce((sum, s) => sum + s.height, 0) // Approximation
    };

    // Position Children
    // We need to distribute them.
    // Left children are positioned to the LEFT.
    // Right children to the RIGHT.

    // Strategy: Stack them outwards? Or align closest to trunk?
    // Usually, we want them close to their parent step.
    // "Shift ENTIRE parent branch".

    // Let's implement a simplified placement:
    // We have a "budget" of Left Width.
    // We place the children relative to the Trunk X.

    // Left Side:
    // We iterate through left children.
    // For each child, we need to determine its X.
    // X = node.x - (child.rightSubtreeWidth + child.boxWidth + gap)?
    // Wait, we computed `node.leftSubtreeWidth` as a SUM.
    // This implies they are arranged non-overlappingly.

    // Simplest interpretation that satisfies rules:
    // All Left Children share the same "columnar space" logic? No, specific steps spawn them.
    // But to satisfy "Sum of widths", we probably act as if they are side-by-side or nested.

    // Actually, maybe the user means recursive width in the sense of:
    //    [LeftChild] - [Node] - [RightChild]
    // If multiple Left Children exist, are they:
    //    [Left1] [Left2] - [Node] ?
    // OR
    //    [Left1]
    //            - [Node]
    //    [Left2]

    // The reference images show only 1 child per side per step?
    // "Any STEP can spawn...".
    // If Step 1 has Left A. Step 2 has Left B.
    // Visual:
    //      [A] -- [Step 1]
    //      [B] -- [Step 2]
    // If A is very wide, does B get pushed left?
    // If we want "No Overlap", keeping them in the same "First Level Left" column might overlap if A is tall and B is close.
    // But they are Sub-Problems with their own vertical stacks.
    // So A is a vertical stack. B is a vertical stack.
    // If A is long, it goes down.
    // So A and B are likely to collide if B is strictly below A.
    // UNLESS we shift X.
    // User Prompt: "leftWidth = sum of all left subtree widths".
    // This strongly implies we Stack them HORIZONTALLY to avoid vertical collision issues entirely?
    // i.e. Level 1 Left, Level 2 Left.
    // OR, we just reserve enough Width for ALL of them.

    // Let's stick to the User's "Sum" rule which is safer.
    // Implementation: We track `currentLeftOffset` and `currentRightOffset`.

    let currentLeftX = x - (CONFIG.GAP_X / 2); // Start to the left of the trunk?
    // Wait, Trunk is Width W. Center is X.
    // Left Edge of trunk = X - W/2.
    // Right Edge of trunk = X + W/2.

    // Assuming Node is centered at X.
    const trunkLeftEdge = x - (node.boxWidth / 2);
    const trunkRightEdge = x + (node.boxWidth / 2);

    // Process Left Children
    // We push them out to the left.
    // To keep them ordered, maybe we process them in Step Index order?
    // User doesn't specify order, but Step order is natural.

    // IMPORTANT: The "SUM" rule implies we tile them?
    // Let's try to pack them.
    // BUT the simplest interpretation of "Sum" is:
    // Child 1 gets position X1.
    // Child 2 gets position X2 = X1 - Width1 - Gap.
    // This guarantees no collisions.

    let leftOffset = trunkLeftEdge - CONFIG.GAP_X;

    const leftChildren = node.children.filter(c => c.side === 'left');
    // Sort by step index to be deterministic?
    leftChildren.sort((a, b) => {
        const stepA = node.steps.find(s => s.id === a.parentStepId)?.index || 0;
        const stepB = node.steps.find(s => s.id === b.parentStepId)?.index || 0;
        return stepA - stepB;
    });

    // To match "Left Subtrees get NEGATIVE x offsets" and "Sum",
    // We probably stack them outwards from the trunk.
    // First child (Step 1) closest? Or furthest?
    // Usually closest is better for verifying alignment.
    // But if we have multiple, and we Sum widths, we must place them without overlap.

    for (const child of leftChildren) {
        // Child Position
        // We want the Right Edge of the Child's Layout Box to be at `leftOffset`.
        // child.x should be center of child.
        // child (x) + (child.boxWidth/2) + child.rightSubtreeWidth = ?
        // Actually, `child.subtreeWidth` is the full width.
        // We need to respect the child's internal tree layout logic.
        // The child's Tree "Block" is `child.subtreeWidth`.

        // We allocate `child.subtreeWidth` space.
        // The Child Node (Trunk) is positioned somewhere inside that space.
        // "Trunk is the horizontal CENTER of the view" (locally?).
        // No, "Trunk ... is the horizontal CENTER".

        // Let's assume we simply place the Child Tree adjacent to the Parent Tree.
        // Position = leftOffset - (child.rightSubtreeWidth + child.boxWidth/2).

        // Wait, simpler approach:
        // Left Children Accumulator.
        // We move LEFTWARDS.

        // We need to know where the Child TRUNK is relative to the Child's Outer Bound.
        // Since Child Trunk is "Center" of its own view usually, but here it's part of a bigger tree.
        // Pass 1 stored `leftSubtreeWidth` and `rightSubtreeWidth` for the child.

        // So Child Tree occupies: [ -child.leftSubtreeWidth ... TRUNK ... +child.rightSubtreeWidth ]
        // Total span: child.left + width + child.right.

        // We want to place this block such that its Rightmost edge touches `leftOffset`.
        // Rightmost edge of child block = ChildTrunkX + (child.boxWidth/2) + child.rightSubtreeWidth.
        // So: ChildTrunkX = leftOffset - (child.boxWidth/2) - child.rightSubtreeWidth.

        const childX = leftOffset - (child.boxWidth / 2) - child.rightSubtreeWidth;

        // Y Position depends on Step
        const parentStep = node.steps.find(s => s.id === child.parentStepId);
        // Find Y of that step. 
        // Step Y logic: node.y + header + (index * stepHeight).
        // Let's perform a mini-calculation or use the accumulated Y so far.
        // Ideally `steps` array is sorted by index.

        let stepY = node.layout.y + node.headerHeight;
        // We assume steps are ordered.
        for (const step of node.steps) {
            if (step.id === child.parentStepId) {
                break;
            }
            stepY += step.height;
        }

        assignPositions(child, childX, stepY);

        // Update offset for next sibling on the left
        // We move further left by the full width of this child tree + gap.
        // Child Tree Width = left + width + right.
        leftOffset -= (child.leftSubtreeWidth + child.boxWidth + child.rightSubtreeWidth + CONFIG.GAP_X);
    }

    // Process Right Children (Symmetric)
    let rightOffset = trunkRightEdge + CONFIG.GAP_X;
    const rightChildren = node.children.filter(c => c.side === 'right');
    rightChildren.sort((a, b) => {
        const stepA = node.steps.find(s => s.id === a.parentStepId)?.index || 0;
        const stepB = node.steps.find(s => s.id === b.parentStepId)?.index || 0;
        return stepA - stepB;
    });

    for (const child of rightChildren) {
        // We want Leftmost edge of child block to touch `rightOffset`.
        // Leftmost edge = ChildTrunkX - (child.boxWidth/2) - child.leftSubtreeWidth.
        // So: ChildTrunkX = rightOffset + (child.boxWidth/2) + child.leftSubtreeWidth.

        const childX = rightOffset + (child.boxWidth / 2) + child.leftSubtreeWidth;

        // Y Position
        let stepY = node.layout.y + node.headerHeight;
        for (const step of node.steps) {
            if (step.id === child.parentStepId) {
                break;
            }
            stepY += step.height;
        }

        assignPositions(child, childX, stepY);

        rightOffset += (child.leftSubtreeWidth + child.boxWidth + child.rightSubtreeWidth + CONFIG.GAP_X);
    }
}
