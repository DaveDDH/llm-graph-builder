"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useStoreApi,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { Toolbar } from "./panels/Toolbar";
import { NodePanel } from "./panels/NodePanel";
import { EdgePanel } from "./panels/EdgePanel";
import { GraphSchema, type Agent } from "../schemas/graph.schema";
import { GRAPH_DATA } from "../utils/loadGraphData";
import {
  schemaNodeToRFNode,
  schemaEdgeToRFEdge,
  rfEdgeToSchemaEdge,
  type RFNodeData,
  type RFEdgeData,
} from "../utils/graphTransformers";

const MIN_DISTANCE = 150;

// Initialize nodes and edges from graph data
function createInitialNodes(): Node<RFNodeData>[] {
  if (!GRAPH_DATA) return [];
  const { graph, nodeWidth } = GRAPH_DATA;
  return graph.nodes.map((n, i) => ({
    ...schemaNodeToRFNode(n, i),
    data: {
      ...schemaNodeToRFNode(n, i).data,
      nodeWidth,
    },
  }));
}

function createInitialEdges(): Edge<RFEdgeData>[] {
  if (!GRAPH_DATA) return [];
  const { graph } = GRAPH_DATA;
  return graph.edges.map((e, i) =>
    schemaEdgeToRFEdge(e, i, graph.nodes)
  );
}

const initialNodes = createInitialNodes();
const initialEdges = createInitialEdges();

function GraphBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const store = useStoreApi();
  const { screenToFlowPosition, fitView, getInternalNode } = useReactFlow();

  // React Flow as source of truth
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Local UI state
  const [tempEdge, setTempEdge] = useState<Edge | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>(GRAPH_DATA?.graph.agents ?? []);

  // Agent management
  const handleAddAgent = useCallback((agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
  }, []);

  const handleUpdateAgent = useCallback(
    (id: string, updates: Partial<Omit<Agent, "id">>) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    },
    []
  );

  const handleDeleteAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log("onConnect");
      setEdges((eds) => addEdge({ ...params, type: "precondition" }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      console.log("onNodeClick", node.id);
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    },
    []
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      console.log("onEdgeClick", edge.id);
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    console.log("onPaneClick");
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const getClosestEdge = useCallback(
    (node: Node) => {
      const { nodeLookup } = store.getState();
      const internalNode = getInternalNode(node.id);
      if (!internalNode) return null;

      const closestNode = Array.from(nodeLookup.values()).reduce(
        (res: { distance: number; node: typeof internalNode | null }, n) => {
          if (n.id !== internalNode.id) {
            const dx =
              n.internals.positionAbsolute.x -
              internalNode.internals.positionAbsolute.x;
            const dy =
              n.internals.positionAbsolute.y -
              internalNode.internals.positionAbsolute.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < res.distance && d < MIN_DISTANCE) {
              res.distance = d;
              res.node = n;
            }
          }
          return res;
        },
        { distance: Number.MAX_VALUE, node: null }
      );

      if (!closestNode.node) {
        return null;
      }

      const closeNodeIsSource =
        closestNode.node.internals.positionAbsolute.x <
        internalNode.internals.positionAbsolute.x;

      return {
        id: closeNodeIsSource
          ? `${closestNode.node.id}-${node.id}`
          : `${node.id}-${closestNode.node.id}`,
        source: closeNodeIsSource ? closestNode.node.id : node.id,
        target: closeNodeIsSource ? node.id : closestNode.node.id,
      };
    },
    [store, getInternalNode]
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const closeEdge = getClosestEdge(node);

      if (closeEdge) {
        const edgeExists = edges.some(
          (e) => e.source === closeEdge.source && e.target === closeEdge.target
        );
        if (!edgeExists) {
          setTempEdge({ ...closeEdge, className: "temp opacity-50" });
        } else {
          setTempEdge(null);
        }
      } else {
        setTempEdge(null);
      }
    },
    [getClosestEdge, edges]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      console.log("onNodeDragStop");
      const closeEdge = getClosestEdge(node);
      setTempEdge(null);

      if (closeEdge) {
        const edgeExists = edges.some(
          (e) => e.source === closeEdge.source && e.target === closeEdge.target
        );
        if (!edgeExists) {
          setEdges((eds) =>
            addEdge({ ...closeEdge, type: "precondition" }, eds)
          );
        }
      }
    },
    [getClosestEdge, edges, setEdges]
  );

  const handleAddNode = useCallback(() => {
    const id = `node_${nanoid(8)}`;
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const screenCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * 0.3,
    };
    const position = screenToFlowPosition(screenCenter);
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 60;
    const centeredPosition = {
      x: position.x - NODE_WIDTH / 2,
      y: position.y - NODE_HEIGHT / 2,
    };

    const newNode: Node<RFNodeData> = {
      id,
      type: "agent",
      position: centeredPosition,
      data: {
        nodeId: id,
        text: "New node",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        nodeWidth: GRAPH_DATA?.nodeWidth ?? 180,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
  }, [screenToFlowPosition, setNodes]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const result = GraphSchema.safeParse(json);
        if (result.success) {
          const newNodes = result.data.nodes.map((n, i) =>
            schemaNodeToRFNode(n, i)
          );
          const newEdges = result.data.edges.map((e, i) =>
            schemaEdgeToRFEdge(e, i, result.data.nodes)
          );
          setNodes(newNodes);
          setEdges(newEdges);
          setTimeout(() => fitView({ padding: 0.2 }), 50);
        } else {
          alert("Invalid graph file: " + result.error.message);
        }
      } catch {
        alert("Failed to parse JSON file");
      }
    };
    input.click();
  }, [setNodes, setEdges, fitView]);

  const handleExport = useCallback(() => {
    const graph = {
      startNode: GRAPH_DATA?.graph.startNode ?? "",
      agents,
      nodes: nodes.map((n) => ({
        id: n.id,
        text: (n.data as RFNodeData).text,
        kind: n.type as "agent" | "agent_decision",
        description: (n.data as RFNodeData).description,
        agent: (n.data as RFNodeData).agent,
        nextNodeIsUser: (n.data as RFNodeData).nextNodeIsUser,
        position: n.position,
      })),
      edges: edges.map((e) => rfEdgeToSchemaEdge(e)),
    };

    const result = GraphSchema.safeParse(graph);
    if (!result.success) {
      alert("Graph has validation errors. Please fix before exporting.");
      return;
    }
    const json = JSON.stringify(graph, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, agents]);

  // Combine edges with temp edge for display
  const displayEdges = tempEdge ? [...edges, tempEdge] : edges;

  return (
    <div className="flex h-screen w-screen flex-col">
      <Toolbar
        onAddNode={handleAddNode}
        onImport={handleImport}
        onExport={handleExport}
      />

      <div className="relative flex-1 overflow-hidden">
        <main ref={reactFlowWrapper} className="absolute inset-0">
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            deleteKeyCode="Delete"
          >
            <Background />
            <Controls />
          </ReactFlow>
        </main>

        {(selectedNodeId || selectedEdgeId) && (
          <aside className="absolute right-0 top-0 bottom-0 w-80 border-l border-gray-200 bg-white">
            {selectedNodeId && (
              <NodePanel
                nodeId={selectedNodeId}
                agents={agents}
                onNodeDeleted={() => setSelectedNodeId(null)}
              />
            )}
            {selectedEdgeId && (
              <EdgePanel
                edgeId={selectedEdgeId}
                onEdgeDeleted={() => setSelectedEdgeId(null)}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export function GraphBuilder() {
  return (
    <ReactFlowProvider>
      <GraphBuilderInner />
    </ReactFlowProvider>
  );
}
