import type { Node, Edge } from "../schemas/graph.schema";
import { dagre } from "../lib/dagre";

interface NodeDimensions {
  width: number;
  height: number;
}

interface LayoutOptions {
  horizontalSpacing?: number;
  verticalSpacing?: number;
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
  nodeDimensions?: Record<string, NodeDimensions>; // Per-node dimensions
  rankdir?: "TB" | "BT" | "LR" | "RL";
}

interface LayoutResult {
  nodes: Node[];
  edges: Edge[]; // All edges, not just tree edges
}

/**
 * Layout algorithm using dagre (Sugiyama method):
 * - Handles all edges including back-edges and cycles
 * - Minimizes edge crossings
 * - Respects per-node dimensions
 */
export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): LayoutResult {
  console.log("[layoutGraph] Starting layout with", nodes.length, "nodes and", edges.length, "edges");

  const {
    horizontalSpacing = 150,
    verticalSpacing = 50,
    defaultNodeWidth = 180,
    defaultNodeHeight = 130,
    nodeDimensions = {},
    rankdir = "LR",
  } = options;

  if (nodes.length === 0) {
    console.log("[layoutGraph] No nodes, returning empty result");
    return { nodes: [], edges: [] };
  }

  // Helper to get node dimensions
  const getNodeDimensions = (nodeId: string): NodeDimensions => {
    return nodeDimensions[nodeId] ?? { width: defaultNodeWidth, height: defaultNodeHeight };
  };

  // Create a new dagre graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir,
    nodesep: verticalSpacing,  // Vertical spacing between nodes in same rank
    ranksep: horizontalSpacing, // Horizontal spacing between ranks
    marginx: 20,
    marginy: 20,
  });

  // Default edge label
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes with their specific dimensions
  nodes.forEach((node) => {
    const dims = getNodeDimensions(node.id);
    g.setNode(node.id, {
      width: dims.width,
      height: dims.height,
      label: node.id,
    });
    console.log(`[layoutGraph] Node ${node.id}: width=${dims.width}, height=${dims.height}`);
  });

  // Add ALL edges (dagre handles back-edges and cycles)
  edges.forEach((edge) => {
    g.setEdge(edge.from, edge.to);
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Extract positions from dagre
  const positions = new Map<string, { x: number; y: number }>();

  g.nodes().forEach((nodeId: string) => {
    const dagreNode = g.node(nodeId);
    const dims = getNodeDimensions(nodeId);
    if (dagreNode) {
      // dagre returns center coordinates, we want top-left
      positions.set(nodeId, {
        x: dagreNode.x - dims.width / 2,
        y: dagreNode.y - dims.height / 2,
      });
    }
  });

  console.log("[layoutGraph] Dagre positions:", Object.fromEntries(positions));

  // Log node spans to verify no overlaps
  console.log("[layoutGraph] Node spans (Y to Y+height):");
  for (const node of nodes) {
    const pos = positions.get(node.id);
    const dims = getNodeDimensions(node.id);
    if (pos) {
      console.log(`  ${node.id}: Y=${pos.y}, height=${dims.height}, spans [${pos.y}, ${pos.y + dims.height}]`);
    }
  }

  // Check for overlaps at same X level
  const nodesByX = new Map<number, { id: string; y: number; height: number }[]>();
  for (const node of nodes) {
    const pos = positions.get(node.id);
    const dims = getNodeDimensions(node.id);
    if (pos) {
      const xKey = Math.round(pos.x);
      if (!nodesByX.has(xKey)) {
        nodesByX.set(xKey, []);
      }
      nodesByX.get(xKey)!.push({ id: node.id, y: pos.y, height: dims.height });
    }
  }

  for (const [xLevel, nodesAtLevel] of nodesByX) {
    nodesAtLevel.sort((a, b) => a.y - b.y);

    for (let i = 0; i < nodesAtLevel.length - 1; i++) {
      const current = nodesAtLevel[i];
      const next = nodesAtLevel[i + 1];
      const currentEnd = current.y + current.height;

      if (currentEnd > next.y) {
        console.error(
          `[layoutGraph] OVERLAP at X=${xLevel}: ${current.id} [${current.y}, ${currentEnd}] overlaps with ${next.id} [${next.y}, ${next.y + next.height}]`
        );
      } else {
        const gap = next.y - currentEnd;
        console.log(
          `[layoutGraph] X=${xLevel}: ${current.id} -> ${next.id}, gap=${gap}`
        );
      }
    }
  }

  // Build final positioned nodes
  const layoutedNodes = nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
  }));

  console.log("[layoutGraph] Final positions:", Object.fromEntries(
    layoutedNodes.map(n => [n.id, n.position])
  ));

  // Return ALL edges (not filtered)
  return {
    nodes: layoutedNodes,
    edges: edges,
  };
}
