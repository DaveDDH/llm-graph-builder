import type { NodeTypes } from "@xyflow/react";
import { AgentNode } from "./Node";

export const nodeTypes: NodeTypes = {
  agent: AgentNode,
  agent_decision: AgentNode,
};

export { AgentNode };
