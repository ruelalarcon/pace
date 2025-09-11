import React, { useState } from "react";
import { TreeNode } from "../types";
import { Clapperboard, Box, ChevronRight } from "lucide-react";
import "./TreeView.css";

interface TreeViewProps {
  treeData: TreeNode[];
  onSelectItem: (node: TreeNode) => void;
  selectedId: string | null;
}

const TreeView: React.FC<TreeViewProps> = ({
  treeData,
  onSelectItem,
  selectedId,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Scene creation moved to floating toolbar in Editor

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id} className="tree-node">
        <div
          className={`tree-node-content ${isSelected ? "selected" : ""}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => onSelectItem(node)}
        >
          <div className="tree-node-label">
            {hasChildren && (
              <button
                className={`tree-expand-button ${isExpanded ? "expanded" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <ChevronRight size={14} />
              </button>
            )}
            <span className={`tree-node-icon ${node.type}`}>
              {node.type === "scene" ? (
                <Clapperboard size={14} />
              ) : (
                <Box size={14} />
              )}
            </span>
            <span className="tree-node-name">{node.name}</span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-view">
      <div className="tree-header">
        <h3 className="tree-title">Project Structure</h3>
      </div>

      <div className="tree-content">
        {treeData.length === 0 ? (
          <div className="tree-empty">
            <p>No scenes yet. Create your first scene!</p>
          </div>
        ) : (
          <div className="tree-nodes">
            {treeData.map((node) => renderTreeNode(node))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeView;
