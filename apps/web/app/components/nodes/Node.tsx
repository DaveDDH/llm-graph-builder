"use client";

import { memo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Separator } from "@/components/ui/separator";
import type { RFNodeData } from "../../utils/graphTransformers";
import { NodeHeader } from "./NodeHeader";
import { NodeBody } from "./NodeBody";
import { Handles } from "./Handles";

function AgentNodeComponent({ data, selected, type }: NodeProps) {
  const nodeData = data as RFNodeData;

  const width = nodeData.nodeWidth ?? 180;
  const muted = nodeData.muted ?? false;
  const isDecision = type === "agent_decision";

  const borderStyle = isDecision ? "border-dashed" : "";
  const borderColor = selected ? "border-primary" : "border-secondary";
  const opacity = muted ? "opacity-40" : "opacity-100";

  const containerBaseStyle =
    "rounded-lg border bg-white p-1 transition-opacity";
  const containerClassname = `${containerBaseStyle} ${borderStyle} ${borderColor} ${opacity}`;

  return (
    <div className={containerClassname} style={{ width: `${width}px` }}>
      <Handles />
      <NodeHeader isDecision={isDecision} agent={nodeData.agent} />
      <Separator />
      <NodeBody nodeId={nodeData.nodeId} description={nodeData.description} />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
