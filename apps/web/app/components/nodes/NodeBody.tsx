export const NodeBody = ({
  nodeId,
  description,
}: {
  nodeId: string;
  description?: string;
}) => {
  return (
    <div className="px-4 py-3">
      <p className="text-sm font-medium text-foreground">{nodeId}</p>
      {description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
