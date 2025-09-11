import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import { Project } from "./types";
import "./App.css";

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleOpenProject = async (projectName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/projects/${encodeURIComponent(projectName)}`,
      );
      const project = await response.json();
      setCurrentProject(project);
    } catch (error) {
      console.error("Error loading project:", error);
    }
    setIsLoading(false);
  };

  const handleCloseProject = () => {
    setCurrentProject(null);
    setIsPreviewMode(false);
  };

  const handleEnterPreview = () => {
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!currentProject) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/projects/${encodeURIComponent(currentProject.name)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProject),
        },
      );

      if (response.ok) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {currentProject ? (
        isPreviewMode ? (
          <Preview project={currentProject} onExitPreview={handleExitPreview} />
        ) : (
          <Editor
            project={currentProject}
            onUpdateProject={handleUpdateProject}
            onCloseProject={handleCloseProject}
            onEnterPreview={handleEnterPreview}
          />
        )
      ) : (
        <Dashboard onOpenProject={handleOpenProject} />
      )}
    </div>
  );
}

export default App;
