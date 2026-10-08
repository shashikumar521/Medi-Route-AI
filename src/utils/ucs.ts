import { GraphEdge, NodeId, UCSResult, UCSStep, UCSElement } from '../types';
import { PriorityQueue } from './priorityQueue';

interface AdjacencyNeighbor {
  node: NodeId;
  cost: number;
  edgeId: string;
}

/**
 * Build adjacency map from edges, filtering out blocked corridors.
 */
export function buildAdjacencyList(
  edges: GraphEdge[]
): Map<NodeId, AdjacencyNeighbor[]> {
  const adj = new Map<NodeId, AdjacencyNeighbor[]>();

  for (const edge of edges) {
    if (edge.blocked) continue;

    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);

    // Hospital corridors can be traversed bidirectionally
    adj.get(edge.from)!.push({ node: edge.to, cost: edge.cost, edgeId: edge.id });
    adj.get(edge.to)!.push({ node: edge.from, cost: edge.cost, edgeId: edge.id });
  }

  return adj;
}

/**
 * Real Uniform Cost Search (UCS) Implementation
 * Expands lowest cumulative cost path using a min-heap Priority Queue.
 *
 * Formal properties:
 * - Complete: Yes (for positive edge weights)
 * - Optimal: Yes
 * - Time Complexity: O(b^(1 + floor(C* / epsilon)))
 * - Space Complexity: O(b^(1 + floor(C* / epsilon)))
 */
export function runUCS(
  start: NodeId,
  goal: NodeId,
  edges: GraphEdge[]
): UCSResult {
  if (!start || !goal) {
    return {
      path: [],
      cost: 0,
      visitedNodes: [],
      steps: [],
      success: false,
      errorMessage: 'Start or goal node is missing.',
    };
  }

  if (start === goal) {
    return {
      path: [start],
      cost: 0,
      visitedNodes: [start],
      steps: [
        {
          stepNumber: 1,
          currentNode: start,
          cumulativeCost: 0,
          queueSnapshot: [],
          visitedSnapshot: [start],
          actionDescription: 'Start and goal are the same node.',
        },
      ],
      success: true,
    };
  }

  const adj = buildAdjacencyList(edges);
  const pq = new PriorityQueue<UCSElement>();
  const visited = new Set<NodeId>();
  const visitedOrder: NodeId[] = [];
  const steps: UCSStep[] = [];
  const bestCostToNode = new Map<NodeId, number>();

  // Enqueue initial start node
  const initialElement: UCSElement = {
    node: start,
    cost: 0,
    path: [start],
    parent: null,
  };
  pq.enqueue(initialElement, 0);
  bestCostToNode.set(start, 0);

  let stepCounter = 1;

  while (!pq.isEmpty()) {
    const queueSnapshotBefore = pq.getSnapshot().map((e) => e.item);
    const popped = pq.dequeue()!;
    const current = popped.item;

    // Log the expansion step
    steps.push({
      stepNumber: stepCounter++,
      currentNode: current.node,
      cumulativeCost: current.cost,
      queueSnapshot: queueSnapshotBefore,
      visitedSnapshot: Array.from(visited),
      actionDescription: `Evaluating node "${current.node}" with cumulative cost g(n) = ${current.cost}`,
    });

    // Check goal condition upon dequeuing (crucial for UCS optimality)
    if (current.node === goal) {
      if (!visited.has(current.node)) {
        visited.add(current.node);
        visitedOrder.push(current.node);
      }
      return {
        path: current.path,
        cost: current.cost,
        visitedNodes: visitedOrder,
        steps,
        success: true,
      };
    }

    // If node already expanded with an equal or lower cost, skip
    if (visited.has(current.node)) {
      continue;
    }

    visited.add(current.node);
    visitedOrder.push(current.node);

    // Expand neighbors
    const neighbors = adj.get(current.node) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.node)) continue;

      const newCumulativeCost = current.cost + neighbor.cost;
      const prevBest = bestCostToNode.get(neighbor.node);

      if (prevBest === undefined || newCumulativeCost < prevBest) {
        bestCostToNode.set(neighbor.node, newCumulativeCost);
        const nextElement: UCSElement = {
          node: neighbor.node,
          cost: newCumulativeCost,
          path: [...current.path, neighbor.node],
          parent: current.node,
        };
        pq.enqueue(nextElement, newCumulativeCost);
      }
    }
  }

  // If priority queue is exhausted and goal never reached
  return {
    path: [],
    cost: 0,
    visitedNodes: visitedOrder,
    steps,
    success: false,
    errorMessage: `No available route found from ${start} to ${goal}. Corridors may be blocked.`,
  };
}

/**
 * Generate human-readable AI explanation of the UCS decision.
 */
export function generateUCSExplanation(
  start: NodeId,
  goal: NodeId,
  result: UCSResult,
  alternativeRoutesCount: number = 2
): string {
  if (!result.success) {
    return `Uniform Cost Search failed to find a valid route between "${start}" and "${goal}". All connecting corridors are either severed or marked blocked. Delivery cannot proceed.`;
  }

  const pathStr = result.path.join(' → ');
  const visitedStr = result.visitedNodes.join(', ');

  return `Uniform Cost Search (UCS) selected this route because its cumulative path cost g(n) = ${result.cost} is strictly the minimum among all reachable topological paths.

Path: ${pathStr}
Total Cost: ${result.cost}
Explored Expansion Order: ${visitedStr} (${result.visitedNodes.length} nodes evaluated)

UCS evaluated all corridor weights dynamically via min-heap priority queue ordering. After delivery at "${goal}", the planning system will trigger a second reverse UCS run to compute the optimal return trajectory to the robot's saved original location.`;
}
