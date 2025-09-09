import React, { useState, useCallback } from 'react';
import { Project, Scene, Element, TreeNode } from '../types';
import TreeView from './TreeView';
import SceneCanvas from './SceneCanvas';
import Inspector from './Inspector';
import './Editor.css';

interface EditorProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onCloseProject: () => void;
}

const Editor: React.FC<EditorProps> = ({ project, onUpdateProject, onCloseProject }) => {
  const [selectedItem, setSelectedItem] = useState<Scene | Element | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'scene' | 'element' | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(
    project.scenes.length > 0 ? project.scenes[0] : null
  );

  const generateTreeData = useCallback((): TreeNode[] => {
    return project.scenes.map(scene => ({
      id: scene.id,
      name: scene.name,
      type: 'scene',
      data: scene,
      children: scene.elements.map(element => ({
        id: element.id,
        name: element.name,
        type: 'element',
        data: element
      }))
    }));
  }, [project.scenes]);

  const handleCreateScene = async (sceneName: string) => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      name: sceneName,
      elements: [],
      aspectRatio: '16:9',
      music: '',
      sceneText: ''
    };

    const updatedProject = {
      ...project,
      scenes: [...project.scenes, newScene]
    };

    onUpdateProject(updatedProject);
    setCurrentScene(newScene);
    setSelectedItem(newScene);
    setSelectedItemType('scene');
  };

  const handleSelectTreeItem = (node: TreeNode) => {
    if (node.type === 'scene') {
      const scene = node.data as Scene;
      setCurrentScene(scene);
      setSelectedItem(scene);
      setSelectedItemType('scene');
    } else if (node.type === 'element') {
      const element = node.data as Element;
      setSelectedItem(element);
      setSelectedItemType('element');
    }
  };

  const handleSelectElement = (element: Element) => {
    setSelectedItem(element);
    setSelectedItemType('element');
  };

  const handleCreateElement = () => {
    if (!currentScene) return;

    const newElement: Element = {
      id: `element_${Date.now()}`,
      name: `Element ${currentScene.elements.length + 1}`,
      x: 0.5,
      y: 0.5,
      width: 0.1,
      height: 0.1,
      destinationScene: '',
      onClickText: '',
      onClickSound: '',
      onClickMusicChange: '',
      highlightOnHover: true,
      highlightColor: '#ffffff'
    };

    const updatedScene = {
      ...currentScene,
      elements: [...currentScene.elements, newElement]
    };

    const updatedProject = {
      ...project,
      scenes: project.scenes.map(scene =>
        scene.id === currentScene.id ? updatedScene : scene
      )
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(newElement);
    setSelectedItemType('element');
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    const updatedProject = {
      ...project,
      scenes: project.scenes.map(scene =>
        scene.id === updatedScene.id ? updatedScene : scene
      )
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(updatedScene);
  };

  const handleUpdateElement = (updatedElement: Element) => {
    if (!currentScene) return;

    const updatedScene = {
      ...currentScene,
      elements: currentScene.elements.map(element =>
        element.id === updatedElement.id ? updatedElement : element
      )
    };

    const updatedProject = {
      ...project,
      scenes: project.scenes.map(scene =>
        scene.id === currentScene.id ? updatedScene : scene
      )
    };

    onUpdateProject(updatedProject);
    setCurrentScene(updatedScene);
    setSelectedItem(updatedElement);
  };

  const handleElementMove = (elementId: string, x: number, y: number) => {
    if (!currentScene) return;

    const updatedElement = currentScene.elements.find(el => el.id === elementId);
    if (!updatedElement) return;

    handleUpdateElement({ ...updatedElement, x, y });
  };

  const handleDeleteItem = (id: string, type: 'scene' | 'element') => {
    let updatedProject: Project;

    if (type === 'scene') {
      updatedProject = {
        ...project,
        scenes: project.scenes.filter(scene => scene.id !== id)
      };

      if (currentScene?.id === id) {
        const newCurrentScene = updatedProject.scenes.length > 0 ? updatedProject.scenes[0] : null;
        setCurrentScene(newCurrentScene);
      }
    } else {
      if (!currentScene) return;

      const updatedScene = {
        ...currentScene,
        elements: currentScene.elements.filter(element => element.id !== id)
      };

      updatedProject = {
        ...project,
        scenes: project.scenes.map(scene =>
          scene.id === currentScene.id ? updatedScene : scene
        )
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
      setSelectedItemType('scene');
    }
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-title">
          <h1>{project.name}</h1>
          {currentScene && <span className="current-scene">/ {currentScene.name}</span>}
        </div>
        <button className="btn btn-secondary" onClick={onCloseProject}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <TreeView
            treeData={generateTreeData()}
            onSelectItem={handleSelectTreeItem}
            onCreateScene={handleCreateScene}
            selectedId={selectedItem?.id || null}
          />
        </div>

        <div className="editor-main">
          <div className="scene-toolbar">
            <button
              className="btn btn-primary btn-small"
              onClick={handleCreateElement}
              disabled={!currentScene}
            >
              + Add Element
            </button>
          </div>

          <SceneCanvas
            scene={currentScene}
            selectedElement={selectedItemType === 'element' ? selectedItem as Element : null}
            onElementMove={handleElementMove}
            onElementSelect={handleSelectElement}
            onCanvasClick={handleCanvasClick}
            projectName={project.name}
          />
        </div>

        <div className="editor-inspector">
          <Inspector
            selectedItem={selectedItem}
            selectedItemType={selectedItemType}
            scenes={project.scenes}
            onUpdateScene={handleUpdateScene}
            onUpdateElement={handleUpdateElement}
            onDeleteItem={handleDeleteItem}
            projectName={project.name}
            currentSceneId={currentScene?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
