import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Plus, X } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  onOpenProject: (projectName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newProjectName }),
      });

      if (response.ok) {
        setNewProjectName('');
        setIsCreating(false);
        loadProjects();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${encodeURIComponent(projectToDelete.name)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjectToDelete(null);
        loadProjects();
      } else {
        alert('Failed to delete project.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
        <h1 className="dashboard-title">PACE Editor</h1>
        <p className="dashboard-subtitle">Point-and-Click Engine</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects">
              <h3>No projects yet</h3>
              <p>Create your first point-and-click adventure game project!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.name}
                className="project-card"
                onClick={() => onOpenProject(project.name)}
              >
                <button
                  className="delete-project-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete(project);
                  }}
                  aria-label="Delete project"
                  title="Delete project"
                >
                  <X size={18} />
                </button>
                <div className="project-card-header">
                  <h3 className="project-name">{project.name}</h3>
                </div>
                <div className="project-card-body">
                  <p className="project-info">
                    {project.scenes.length} scene{project.scenes.length !== 1 ? 's' : ''}
                  </p>
                  <p className="project-date">
                    Created {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>
            ))
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
                    if (e.key === 'Enter') {
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
                  setNewProjectName('');
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
              <p>Are you sure you want to delete the project "<strong>{projectToDelete.name}</strong>"?</p>
              <p>This action is irreversible and will delete all associated files.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteProject}
              >
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
