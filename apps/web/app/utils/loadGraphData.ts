import type { Graph, Node } from "../schemas/graph.schema";
import { GraphSchema } from "../schemas/graph.schema";
import { layoutGraph } from "./layoutGraph";
import graphData from "../data/graph.json";

interface LoadGraphResult {
  graph: Graph;
  nodeWidth: number;
}

function calculateNodeWidth(nodes: Graph["nodes"]): number {
  const maxIdLength = Math.max(...nodes.map((n) => n.id.length));
  const nodePadding = 40;
  return maxIdLength * 7.5 + nodePadding;
}

/**
 * Estimate node height based on content.
 * This approximates the rendered height based on:
 * - Header: ~32px (icon + agent name)
 * - Separator: ~1px
 * - Body: varies based on text/description
 * - Padding: ~16px
 */
function estimateNodeHeight(node: Node, nodeWidth: number): number {
  const headerHeight = 32;
  const separatorHeight = 1;
  const paddingHeight = 16;
  const lineHeight = 20;
  const charWidth = 7; // Approximate character width

  // Estimate text lines
  const charsPerLine = Math.floor((nodeWidth - 16) / charWidth);
  const textLines = node.text ? Math.ceil(node.text.length / charsPerLine) : 0;

  // Estimate description lines
  const descLines = node.description ? Math.ceil(node.description.length / charsPerLine) : 0;

  const bodyHeight = (textLines + descLines) * lineHeight + 8; // 8px for body padding

  return headerHeight + separatorHeight + bodyHeight + paddingHeight;
}

/**
 * Calculate per-node dimensions for layout
 */
function calculateNodeDimensions(
  nodes: Graph["nodes"],
  nodeWidth: number
): Record<string, { width: number; height: number }> {
  const dimensions: Record<string, { width: number; height: number }> = {};

  for (const node of nodes) {
    const height = Math.max(80, estimateNodeHeight(node, nodeWidth)); // Minimum 80px
    dimensions[node.id] = { width: nodeWidth, height };
  }

  console.log("[loadGraphData] Node dimensions:", dimensions);
  return dimensions;
}

function ensureNodePositions(graph: Graph, nodeWidth: number): Graph {
  const hasPositions = graph.nodes.every((node) => node.position !== undefined);

  if (hasPositions) {
    return graph;
  }

  const horizontalGap = 150;
  const verticalGap = 50;
  const nodeDimensions = calculateNodeDimensions(graph.nodes, nodeWidth);

  const layoutResult = layoutGraph(graph.nodes, graph.edges, {
    horizontalSpacing: nodeWidth + horizontalGap,
    verticalSpacing: verticalGap,
    defaultNodeWidth: nodeWidth,
    defaultNodeHeight: 130,
    nodeDimensions,
    rankdir: "LR",
  });

  return {
    ...graph,
    nodes: layoutResult.nodes,
    edges: layoutResult.edges,
  };
}

export function loadGraphData(): LoadGraphResult | null {
  const result = GraphSchema.safeParse(graphData);

  if (!result.success) {
    console.error(
      "[loadGraphData] Graph validation failed:",
      result.error.format(),
    );
    return null;
  }

  const nodeWidth = calculateNodeWidth(result.data.nodes);
  const graph = ensureNodePositions(result.data, nodeWidth);

  return { graph, nodeWidth };
}

export function findInitialNodePosition(
  graph: Graph,
): { x: number; y: number } | null {
  const initialNode = graph.nodes.find((n) => n.id === "INITIAL_STEP");
  return initialNode?.position ?? null;
}

export function calculateInitialViewport(
  initialNodePosition: { x: number; y: number },
  containerHeight: number,
): { x: number; y: number; zoom: number } {
  const nodeHeight = 120;
  const padding = 50;

  return {
    x: -initialNodePosition.x + padding,
    y: -initialNodePosition.y + containerHeight / 2 - nodeHeight / 2,
    zoom: 1,
  };
}

export const GRAPH_DATA = loadGraphData();
