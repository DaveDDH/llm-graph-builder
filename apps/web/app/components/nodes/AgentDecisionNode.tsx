"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch, User } from "lucide-react";
import type { RFNodeData } from "../../utils/graphTransformers";

function AgentDecisionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as RFNodeData;

  return (
    <div
      className={`min-w-[180px] max-w-[240px] rounded-lg border border-dashed bg-white p-3 ${
        selected ? "border-primary" : "border-secondary"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          borderColor: selected ? "var(--primary)" : "var(--secondary)",
          backgroundColor: "white",
          width: "10px",
          height: "10px",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          borderColor: selected ? "var(--primary)" : "var(--secondary)",
          backgroundColor: "white",
          width: "10px",
          height: "10px",
        }}
      />

      <div className="mb-1 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-black" />
        <span className="text-xs font-medium text-black">
          {nodeData.agent ?? "Decision"}
        </span>
        {nodeData.nextNodeIsUser && (
          <User className="ml-auto h-3 w-3 text-black/60" />
        )}
      </div>

      <p className="line-clamp-2 text-sm text-foreground">{nodeData.text}</p>
    </div>
  );
}

export const AgentDecisionNode = memo(AgentDecisionNodeComponent);
