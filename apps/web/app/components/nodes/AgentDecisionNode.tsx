"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { RFNodeData } from "../../utils/graphTransformers";

const HANDLE_SIZE = 16;
const ICON_SIZE = 12;

function AgentDecisionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as RFNodeData;

  const width = nodeData.nodeWidth ?? 180;
  const borderColor = selected ? "var(--primary)" : "var(--secondary)";

  return (
    <div
      className={`rounded-lg border border-dashed bg-white transition-opacity ${
        selected ? "border-primary" : "border-secondary"
      } ${nodeData.muted ? "opacity-40" : "opacity-100"}`}
      style={{ width: `${width}px` }}
    >
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{
          borderColor,
          backgroundColor: "var(--xy-background-color)",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          left: "35%",
          borderWidth: 0,
          borderBottomWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-red-400"
          style={{ transform: "rotate(90deg)" }}
        />
      </Handle>
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          borderColor,
          backgroundColor: "white",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          left: "65%",
          borderWidth: 0,
          borderTopWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-green-500"
          style={{ transform: "rotate(-90deg)" }}
        />
      </Handle>

      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{
          borderColor,
          backgroundColor: "var(--xy-background-color)",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          left: "35%",
          borderWidth: 0,
          borderTopWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-red-400"
          style={{ transform: "rotate(-90deg)" }}
        />
      </Handle>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          borderColor,
          backgroundColor: "white",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          left: "65%",
          borderWidth: 0,
          borderBottomWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-green-500"
          style={{ transform: "rotate(90deg)" }}
        />
      </Handle>

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{
          borderColor,
          backgroundColor: "var(--xy-background-color)",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          top: "35%",
          borderWidth: 0,
          borderRightWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-red-400"
          style={{ transform: "rotate(0deg)" }}
        />
      </Handle>
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{
          borderColor,
          backgroundColor: "white",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          top: "65%",
          borderWidth: 0,
          borderLeftWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-green-500"
          style={{ transform: "rotate(180deg)" }}
        />
      </Handle>

      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{
          borderColor,
          backgroundColor: "var(--xy-background-color)",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          top: "35%",
          borderWidth: 0,
          borderLeftWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-red-400"
          style={{ transform: "rotate(180deg)" }}
        />
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          borderColor,
          backgroundColor: "white",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          top: "65%",
          borderWidth: 0,
          borderRightWidth: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight
          size={ICON_SIZE}
          className="text-green-500"
          style={{ transform: "rotate(0deg)" }}
        />
      </Handle>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase text-muted-foreground">Decision Node</span>
        {nodeData.agent && (
          <Badge variant="outline" className="ml-auto border-secondary bg-white uppercase">
            {nodeData.agent}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-foreground">{nodeData.nodeId}</p>
        {nodeData.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {nodeData.description}
          </p>
        )}
      </div>
    </div>
  );
}

export const AgentDecisionNode = memo(AgentDecisionNodeComponent);
