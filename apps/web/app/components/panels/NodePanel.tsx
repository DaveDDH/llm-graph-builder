"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNodes, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { RFNodeData } from "../../utils/graphTransformers";
import type { Node } from "@xyflow/react";

interface NodePanelProps {
  nodeId: string;
  onNodeDeleted?: () => void;
  onNodeIdChanged?: (newId: string) => void;
}

export function NodePanel({
  nodeId,
  onNodeDeleted,
  onNodeIdChanged,
}: NodePanelProps) {
  const nodes = useNodes<Node<RFNodeData>>();
  const { setNodes, setEdges } = useReactFlow();

  const node = nodes.find((n) => n.id === nodeId);
  const nodeData = node?.data;

  const [prevNodeId, setPrevNodeId] = useState(nodeId);
  const [id, setId] = useState(node?.id ?? "");

  // Reset form when selecting a different node
  if (nodeId !== prevNodeId) {
    setPrevNodeId(nodeId);
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (currentNode) {
      setId(currentNode.id);
    }
  }

  if (!node || !nodeData) {
    return <div className="p-4 text-muted-foreground">Node not found</div>;
  }

  const updateNodeData = (updates: Partial<RFNodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n,
      ),
    );
  };

  const updateNodeType = (newType: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, type: newType } : n)),
    );
  };

  const handleIdBlur = () => {
    if (id !== nodeId && id.trim()) {
      const newId = id.trim();
      // Rename node: update node id and all edges referencing it
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, id: newId, data: { ...n.data, nodeId: newId } }
            : n,
        ),
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          id: e.id.replace(nodeId, newId),
          source: e.source === nodeId ? newId : e.source,
          target: e.target === nodeId ? newId : e.target,
        })),
      );
      // Notify parent of the ID change
      onNodeIdChanged?.(newId);
    }
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    onNodeDeleted?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-2 px-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Node Properties</h4>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete node"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete node?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  node and remove all its connections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onBlur={handleIdBlur}
              placeholder="Node ID..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={nodeData.description}
              onChange={(e) => updateNodeData({ description: e.target.value })}
              rows={2}
              placeholder="Node description..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              value={nodeData.text}
              onChange={(e) => updateNodeData({ text: e.target.value })}
              rows={3}
              placeholder="Node text..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDecisionNode"
                checked={node.type === "agent_decision"}
                onCheckedChange={(checked) =>
                  updateNodeType(checked ? "agent_decision" : "agent")
                }
              />
              <Label htmlFor="isDecisionNode">Is this a decision node?</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="nextNodeIsUser"
                checked={nodeData.nextNodeIsUser ?? false}
                onCheckedChange={(checked) =>
                  updateNodeData({
                    nextNodeIsUser: checked === true || undefined,
                  })
                }
              />
              <Label htmlFor="nextNodeIsUser">
                Next node expects user input
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
