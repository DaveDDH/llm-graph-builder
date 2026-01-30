"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

function StartNodeComponent({ selected }: NodeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-green-500 px-6 py-3 ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <span className="text-sm font-semibold uppercase tracking-wide text-white">
        Start
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          backgroundColor: "white",
          width: "12px",
          height: "12px",
          border: "2px solid #22c55e",
        }}
      />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);
