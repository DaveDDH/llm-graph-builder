import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Brain, Wrench } from "lucide-react";

export type NodeKind = "agent" | "user_routing" | "agent_decision" | "tool_call";

interface NodeHeaderProps {
  nodeKind: NodeKind;
  agent?: string;
}

const NodeHeaderComponent = ({ nodeKind, agent }: NodeHeaderProps) => {
  let headerLabel: string;
  let headerIcon: React.ReactNode;
  let colorClass: string;

  switch (nodeKind) {
    case "user_routing":
      headerLabel = "User Routing";
      colorClass = "text-green-700";
      headerIcon = <MessageSquare className={`h-4 w-4 ${colorClass}`} />;
      break;
    case "agent_decision":
      headerLabel = "Agent Decision";
      colorClass = "text-purple-700";
      headerIcon = <Brain className={`h-4 w-4 ${colorClass}`} />;
      break;
    case "tool_call":
      headerLabel = "Tool Call";
      colorClass = "text-orange-700";
      headerIcon = <Wrench className={`h-4 w-4 ${colorClass}`} />;
      break;
    default:
      headerLabel = "Agent Node";
      colorClass = "text-muted-foreground";
      headerIcon = <Bot className={`h-4 w-4 ${colorClass}`} />;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {headerIcon}
      <span className={`text-xs font-medium uppercase ${colorClass}`}>
        {headerLabel}
      </span>
      {agent && (
        <Badge
          variant="outline"
          className="ml-auto border-secondary bg-white uppercase"
        >
          {agent}
        </Badge>
      )}
    </div>
  );
};

export const NodeHeader = memo(NodeHeaderComponent, (prev, next) =>
  prev.nodeKind === next.nodeKind && prev.agent === next.agent
);
