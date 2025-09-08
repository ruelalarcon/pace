import React, { useState } from 'react';
import { TreeNode } from '../types';
import './TreeView.css';

interface TreeViewProps {
  treeData: TreeNode[];
  onSelectItem: (node: TreeNode) => void;
  onCreateScene: (sceneName: string) => void;
  selectedId: string | null;
}

const TreeView: React.FC<TreeViewProps> = ({ 
  treeData, 
  onSelectItem, 
  onCreateScene,
  selectedId 
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCreateScene = () => {
    if (!newSceneName.trim()) return;
    onCreateScene(newSceneName);
    setNewSceneName('');
    setIsCreatingScene(false);
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id} className="tree-node">
        <div 
          className={`tree-node-content ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => onSelectItem(node)}
        >
          <div className="tree-node-label">
            {hasChildren && (
              <button
                className={`tree-expand-button ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
              >
                ▶
              </button>
            )}
            <span className={`tree-node-icon ${node.type}`}>
              {node.type === 'scene' ? '🎬' : '📦'}
            </span>
            <span className="tree-node-name">{node.name}</span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-view">
      <div className="tree-header">
        <h3 className="tree-title">Project Structure</h3>
        <button 
          className="btn btn-primary btn-small"
          onClick={() => setIsCreatingScene(true)}
        >
          + Scene
        </button>
      </div>

      <div className="tree-content">
        {treeData.length === 0 ? (
          <div className="tree-empty">
            <p>No scenes yet. Create your first scene!</p>
          </div>
        ) : (
          <div className="tree-nodes">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        )}
      </div>

      {isCreatingScene && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Scene</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Scene Name</label>
                <input
                  type="text"
                  className="input"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="Enter scene name..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateScene();
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setIsCreatingScene(false);
                  setNewSceneName('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateScene}
                disabled={!newSceneName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeView;
