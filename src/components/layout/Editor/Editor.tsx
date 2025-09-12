import React, { useState, useCallback } from "react";
import { Project, Scene, Element, TreeNode } from "../../../types";
import { apiService } from "../../../services/api";
import TreeView from "../../panels/TreeView/TreeView";
import SceneCanvas from "../../panels/SceneCanvas/SceneCanvas";
import Inspector from "../../panels/Inspector/Inspector";
import { Clapperboard, Box, Trash2, Play, Download } from "lucide-react";
import "./Editor.css";

interface EditorProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onCloseProject: () => void;
  onEnterPreview: () => void;
}

const Editor: React.FC<EditorProps> = ({
  project,
  onUpdateProject,
  onCloseProject,
  onEnterPreview,
}) => {
  const [selectedItem, setSelectedItem] = useState<Scene | Element | null>(
    null,
  );
  const [selectedItemType, setSelectedItemType] = useState<
    "scene" | "element" | null
  >(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(
    project.scenes.length > 0 ? project.scenes[0] : null,
  );
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState("");
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const generateTreeData = useCallback((): TreeNode[] => {
    return project.scenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      type: "scene",
      data: scene,
      children: scene.elements.map((element) => ({
        id: element.id,
        name: element.name,
        type: "element",
        data: element,
      })),
    }));
  }, [project.scenes]);

  const handleCreateScene = async (sceneName: string) => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      name: sceneName,
      elements: [],
      aspectRatio: "16:9",
      music: "",
      sceneText: "",
    };

    const updatedProject = {
      ...project,
      scenes: [...project.scenes, newScene],
    };

    onUpdateProject(updatedProject);
    setCurrentScene(newScene);
    setSelectedItem(newScene);
    setSelectedItemType("scene");
  };

  const openCreateSceneModal = () => {
    setNewSceneName("");
    setIsCreatingScene(true);
  };

  const confirmCreateScene = () => {
    if (!newSceneName.trim()) return;
    handleCreateScene(newSceneName.trim());
    setIsCreatingScene(false);
  };

  const handleDeleteClick = () => {
    if (selectedItem) {
      setIsDeleteConfirmVisible(true);
    }
  };

  const confirmDelete = () => {
    if (selectedItem && selectedItemType) {
      handleDeleteItem(selectedItem.id, selectedItemType);
    }
    setIsDeleteConfirmVisible(false);
  };

  const handleSelectTreeItem = (node: TreeNode) => {
    if (node.type === "scene") {
      const scene = node.data as Scene;
      setCurrentScene(scene);
      setSelectedItem(scene);
      setSelectedItemType("scene");
    } else if (node.type === "element") {
      const element = node.data as Element;
      setSelectedItem(element);
      setSelectedItemType("element");
    }
  };

  const handleSelectElement = (element: Element) => {
    setSelectedItem(element);
    setSelectedItemType("element");
  };

  const handleCreateElement = () => {
    if (!currentScene) return;

    const newElement: Element = {
      id: `element_${Date.now()}`,
      name: `Element ${currentScene.elements.length + 1}`,
      x: 0.5,
      y: 0.5,
      scale: 0.2,
      aspectRatio: 1,
      destinationScene: "",
      onClickText: "",
      onClickSound: "",
      onClickMusicChange: "",
      highlightOnHover: true,
      highlightColor: "#ffffff",
      cornerRadius: 0,
    };

    const updatedScene = {
      ...currentScene,
      elements: [...currentScene.elements, newElement],
    };

    const updatedProject = {
      ...project,
      scenes: project.scenes.map((scene) =>
        scene.id === currentScene.id ? updatedScene : scene,
      ),
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(newElement);
    setSelectedItemType("element");
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    const updatedProject = {
      ...project,
      scenes: project.scenes.map((scene) =>
        scene.id === updatedScene.id ? updatedScene : scene,
      ),
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(updatedScene);
  };

  const handleUpdateElement = (updatedElement: Element) => {
    if (!currentScene) return;

    const updatedScene = {
      ...currentScene,
      elements: currentScene.elements.map((element) =>
        element.id === updatedElement.id ? updatedElement : element,
      ),
    };

    const updatedProject = {
      ...project,
      scenes: project.scenes.map((scene) =>
        scene.id === currentScene.id ? updatedScene : scene,
      ),
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(updatedElement);
  };

  const handleElementMove = (elementId: string, x: number, y: number) => {
    if (!currentScene) return;

    const updatedElement = currentScene.elements.find(
      (el) => el.id === elementId,
    );
    if (!updatedElement) return;

    handleUpdateElement({ ...updatedElement, x, y });
  };

  const handleDeleteItem = (id: string, type: "scene" | "element") => {
    let updatedProject: Project;

    if (type === "scene") {
      updatedProject = {
        ...project,
        scenes: project.scenes.filter((scene) => scene.id !== id),
      };

      if (currentScene?.id === id) {
        const newCurrentScene =
          updatedProject.scenes.length > 0 ? updatedProject.scenes[0] : null;
        setCurrentScene(newCurrentScene);
      }
    } else {
      if (!currentScene) return;

      const updatedScene = {
        ...currentScene,
        elements: currentScene.elements.filter((element) => element.id !== id),
      };

      updatedProject = {
        ...project,
        scenes: project.scenes.map((scene) =>
          scene.id === currentScene.id ? updatedScene : scene,
        ),
      };

      setCurrentScene(updatedScene);
    }

    onUpdateProject(updatedProject);
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const handleCanvasClick = () => {
    if (currentScene) {
      setSelectedItem(currentScene);
      setSelectedItemType("scene");
    }
  };

  const handleDeselect = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const handleExportProject = async () => {
    try {
      const blob = await apiService.exportProject(project.name);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting project:", error);
    }
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-title">
          <h1>{project.name}</h1>
          {currentScene && (
            <span className="current-scene">/ {currentScene.name}</span>
          )}
        </div>
        <div className="editor-header-actions">
          <button className="btn btn-secondary" onClick={handleExportProject}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-primary" onClick={onEnterPreview}>
            <Play size={16} /> Preview
          </button>
          <button className="btn btn-secondary" onClick={onCloseProject}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <TreeView
            treeData={generateTreeData()}
            onSelectItem={handleSelectTreeItem}
            selectedId={selectedItem?.id || null}
          />
        </div>

        <div className="editor-main" onClick={handleDeselect}>
          <SceneCanvas
            scene={currentScene}
            selectedElement={
              selectedItemType === "element" ? (selectedItem as Element) : null
            }
            onElementMove={handleElementMove}
            onElementSelect={handleSelectElement}
            onCanvasClick={handleCanvasClick}
          />

          <div
            className="floating-toolbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-secondary btn-small"
              onClick={openCreateSceneModal}
            >
              <Clapperboard size={14} /> Add Scene
            </button>
            <button
              className="btn btn-primary btn-small"
              onClick={handleCreateElement}
              disabled={!currentScene}
            >
              <Box size={14} /> Add Element
            </button>
            <button
              className="btn btn-danger btn-small"
              onClick={handleDeleteClick}
              disabled={!selectedItem}
              title={
                selectedItem
                  ? `Delete ${selectedItem.name}`
                  : "Select an item to delete"
              }
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="editor-inspector">
          <Inspector
            selectedItem={selectedItem}
            selectedItemType={selectedItemType}
            scenes={project.scenes}
            onUpdateScene={handleUpdateScene}
            onUpdateElement={handleUpdateElement}
            projectName={project.name}
            currentSceneId={currentScene?.id}
          />
        </div>
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
                    if (e.key === "Enter") confirmCreateScene();
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsCreatingScene(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmCreateScene}
                disabled={!newSceneName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmVisible && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Deletion</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete "{selectedItem.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeleteConfirmVisible(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
