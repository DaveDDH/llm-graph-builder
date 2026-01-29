import { Position, type Node as RFNode, type Edge as RFEdge } from "@xyflow/react";
import type {
  Node as SchemaNode,
  Edge as SchemaEdge,
  Precondition,
  ContextPreconditions,
} from "../schemas/graph.schema";

// Default node dimensions for handle calculation
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 80;

interface HandlePair {
  sourceHandle: string;
  targetHandle: string;
}

/**
 * Calculate the closest source and target handles based on node positions.
 * Returns handle IDs that minimize the distance between connected nodes.
 */
function getClosestHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  nodeWidth: number = DEFAULT_NODE_WIDTH,
  nodeHeight: number = DEFAULT_NODE_HEIGHT
): HandlePair {
  // Calculate center positions of each node
  const sourceCenter = {
    x: sourcePos.x + nodeWidth / 2,
    y: sourcePos.y + nodeHeight / 2,
  };
  const targetCenter = {
    x: targetPos.x + nodeWidth / 2,
    y: targetPos.y + nodeHeight / 2,
  };

  // Calculate direction from source to target
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  // Determine primary direction based on larger delta
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal movement is dominant
    if (dx > 0) {
      // Target is to the right of source
      return { sourceHandle: "right-source", targetHandle: "left-target" };
    } else {
      // Target is to the left of source
      return { sourceHandle: "left-source", targetHandle: "right-target" };
    }
  } else {
    // Vertical movement is dominant
    if (dy > 0) {
      // Target is below source
      return { sourceHandle: "bottom-source", targetHandle: "top-target" };
    } else {
      // Target is above source
      return { sourceHandle: "top-source", targetHandle: "bottom-target" };
    }
  }
}

export interface RFNodeData extends Record<string, unknown> {
  nodeId: string;
  text: string;
  description: string;
  agent?: string;
  nextNodeIsUser?: boolean;
  muted?: boolean;
  nodeWidth?: number | null;
}

export interface RFEdgeData extends Record<string, unknown> {
  preconditions?: Precondition[];
  contextPreconditions?: ContextPreconditions;
  muted?: boolean;
}

export function schemaNodeToRFNode(node: SchemaNode, index = 0): RFNode<RFNodeData> {
  // Generate default position if not provided (grid layout)
  const defaultPosition = {
    x: (index % 5) * 300,
    y: Math.floor(index / 5) * 150,
  };

  return {
    id: node.id,
    type: node.kind,
    position: node.position ?? defaultPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      nodeId: node.id,
      text: node.text,
      description: node.description,
      agent: node.agent,
      nextNodeIsUser: node.nextNodeIsUser,
    },
  };
}

export function rfNodeToSchemaNode(
  rfNode: RFNode,
  originalNode: SchemaNode
): SchemaNode {
  const data = rfNode.data as RFNodeData | undefined;
  return {
    id: rfNode.id,
    text: data?.text ?? originalNode.text,
    kind: originalNode.kind,
    description: data?.description ?? originalNode.description,
    agent: data?.agent ?? originalNode.agent,
    nextNodeIsUser: data?.nextNodeIsUser ?? originalNode.nextNodeIsUser,
    position: rfNode.position,
  };
}

export function schemaEdgeToRFEdge(
  edge: SchemaEdge,
  index = 0,
  nodes?: SchemaNode[]
): RFEdge<RFEdgeData> {
  // Calculate closest handles if nodes are provided
  let sourceHandle: string | undefined;
  let targetHandle: string | undefined;

  if (nodes) {
    const sourceNode = nodes.find((n) => n.id === edge.from);
    const targetNode = nodes.find((n) => n.id === edge.to);

    if (sourceNode?.position && targetNode?.position) {
      const handles = getClosestHandles(sourceNode.position, targetNode.position);
      sourceHandle = handles.sourceHandle;
      targetHandle = handles.targetHandle;
    }
  }

  return {
    id: `${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    sourceHandle,
    targetHandle,
    type: "precondition",
    data: {
      preconditions: edge.preconditions,
      contextPreconditions: edge.contextPreconditions,
    },
  };
}

export function rfEdgeToSchemaEdge(rfEdge: RFEdge<RFEdgeData>): SchemaEdge {
  return {
    from: rfEdge.source,
    to: rfEdge.target,
    preconditions: rfEdge.data?.preconditions,
    contextPreconditions: rfEdge.data?.contextPreconditions,
  };
}
