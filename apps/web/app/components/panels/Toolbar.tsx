"use client";

import { Upload, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  onAddNode: () => void;
  onImport: () => void;
  onExport: () => void;
}

export function Toolbar({ onAddNode, onImport, onExport }: ToolbarProps) {
  return (
    <header className="flex items-center justify-center gap-6 border-b bg-background px-4 py-3">
      <Button variant="outline" size="sm" onClick={onAddNode}>
        <Plus className="h-4 w-4" />
        Add node
      </Button>
      <Button variant="outline" size="sm" onClick={onImport}>
        <Upload className="h-4 w-4" />
        Import
      </Button>
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </header>
  );
}
