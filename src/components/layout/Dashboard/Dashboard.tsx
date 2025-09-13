import React, { useState, useEffect, useMemo } from "react";
import { Project } from "../../../types";
import { apiService } from "../../../services/api";
import {
  Plus,
  Trash2,
  Search,
  Layers,
  Shapes,
  Calendar,
  FolderOpen,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import "./Dashboard.css";

interface DashboardProps {
  onOpenProject: (projectName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "scenes">("recent");
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    loadProjects();
    initializeServerUrl();
  }, []);

  const initializeServerUrl = async () => {
    try {
      const url = await apiService.getResourceUrl("");
      setServerUrl(url);
    } catch (error) {
      console.error("Error getting server URL:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      await apiService.createProject(newProjectName);
      setNewProjectName("");
      setIsCreating(false);
      loadProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create project",
      );
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await apiService.deleteProject(projectToDelete.name);
      setProjectToDelete(null);
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totals = useMemo(() => {
    const totalScenes = projects.reduce((acc, p) => acc + p.scenes.length, 0);
    const totalElements = projects.reduce(
      (acc, p) => acc + p.scenes.reduce((s, sc) => s + sc.elements.length, 0),
      0,
    );
    return { totalScenes, totalElements };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = projects.filter((p) => p.name.toLowerCase().includes(q));

    switch (sortBy) {
      case "name":
        list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "scenes":
        list = list.slice().sort((a, b) => b.scenes.length - a.scenes.length);
        break;
      case "recent":
      default:
        list = list
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        break;
    }
    return list;
  }, [projects, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="title-container">
          <img
            src="./resources/logo.svg"
            alt="PACE Logo"
            className="dashboard-logo"
          />
          <h1 className="dashboard-title">PACE Editor</h1>
        </div>
        <p className="dashboard-subtitle">
          The <span className="dashboard-subtitle-highlight">P</span>oint-
          <span className="dashboard-subtitle-highlight">a</span>nd-
          <span className="dashboard-subtitle-highlight">C</span>lick{" "}
          <span className="dashboard-subtitle-highlight">E</span>ngine Editor
        </p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              className="input search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <div className="select-wrapper">
              <select
                className="input select sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "recent" | "name" | "scenes")
                }
                aria-label="Sort projects"
              >
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name</option>
                <option value="scenes">Sort: Scenes</option>
              </select>
              <div className="select-arrow">
                <ChevronDown size={16} />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-chip">
            <Layers size={14} /> {totals.totalScenes} scenes
          </div>
          <div className="stat-chip">
            <Shapes size={14} /> {totals.totalElements} elements
          </div>
          <div className="stat-chip">{filteredProjects.length} projects</div>
        </div>

        <div className="projects-grid">
          {filteredProjects.length === 0 ? (
            <div className="no-projects">
              <h3>No matching projects</h3>
              <p>Try a different search or create a new project.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const sceneCount = project.scenes.length;
              const elementCount = project.scenes.reduce(
                (acc, s) => acc + s.elements.length,
                0,
              );
              const thumb = project.scenes.find(
                (s) => s.backgroundImage,
              )?.backgroundImage;

              return (
                <div
                  key={project.name}
                  className="project-card"
                  onClick={() => onOpenProject(project.name)}
                >
                  <div
                    className="project-thumb"
                    style={
                      thumb && serverUrl
                        ? {
                            backgroundImage: `url(${serverUrl}${thumb})`,
                          }
                        : undefined
                    }
                  >
                    {!thumb && (
                      <div className="thumb-empty">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div className="thumb-overlay" />
                  </div>

                  <div className="project-card-header">
                    <h3 className="project-name">{project.name}</h3>
                  </div>
                  <div className="project-card-body">
                    <div className="project-meta">
                      <span className="meta-item">
                        <Layers size={14} /> {sceneCount}
                      </span>
                      <span className="meta-item">
                        <Shapes size={14} /> {elementCount}
                      </span>
                      <span className="meta-item">
                        <Calendar size={14} /> {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="project-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project.name);
                      }}
                    >
                      <FolderOpen size={14} /> Open
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isCreating && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Project</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="input"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateProject();
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Delete Project</h2>
            </div>
            <div className="modal-body">
              <p className="modal-content">
                Are you sure you want to delete the project <strong>{projectToDelete.name}</strong>?
                This action is irreversible and will delete all associated files.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
