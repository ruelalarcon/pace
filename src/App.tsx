import { useState } from 'react';

import './App.css';
import TitleBar from './components/common/TitleBar/TitleBar';
import Dashboard from './components/layout/Dashboard/Dashboard';
import Editor from './components/layout/Editor/Editor';
import Preview from './components/layout/Preview/Preview';
import { apiService } from './services/api';
import { Project } from './types';

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewSceneId, setPreviewSceneId] = useState<string | undefined>(
    undefined,
  );
  const [currentSceneName, setCurrentSceneName] = useState<string | undefined>(
    undefined,
  );

  const handleOpenProject = async (projectName: string) => {
    setIsLoading(true);
    try {
      const project = await apiService.getProject(projectName);
      setCurrentProject(project);
    } catch (error) {
      console.error('Error loading project:', error);
    }
    setIsLoading(false);
  };

  const handleCloseProject = () => {
    setCurrentProject(null);
    setIsPreviewMode(false);
    setPreviewSceneId(undefined);
    setCurrentSceneName(undefined);
  };

  const handleEnterPreview = (sceneId?: string) => {
    setPreviewSceneId(sceneId);
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!currentProject) return;

    try {
      await apiService.updateProject(currentProject.name, updatedProject);
      setCurrentProject(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="App has-title-bar">
        <TitleBar title="PACE Editor" />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  const getTitleBarTitle = () => {
    if (currentProject) {
      return `PACE Editor - ${currentProject.name}`;
    }
    return 'PACE Editor';
  };

  return (
    <div className="App has-title-bar">
      <TitleBar
        title={getTitleBarTitle()}
        currentScene={currentSceneName}
        subtitle={isPreviewMode ? 'Preview Mode' : undefined}
      />
      {currentProject ? (
        isPreviewMode ? (
          <Preview
            project={currentProject}
            onExitPreview={handleExitPreview}
            initialSceneId={previewSceneId}
          />
        ) : (
          <Editor
            project={currentProject}
            onUpdateProject={handleUpdateProject}
            onCloseProject={handleCloseProject}
            onEnterPreview={handleEnterPreview}
            onSceneChange={setCurrentSceneName}
          />
        )
      ) : (
        <Dashboard onOpenProject={handleOpenProject} />
      )}
    </div>
  );
}

export default App;
