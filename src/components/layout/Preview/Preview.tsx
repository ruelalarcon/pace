import React, { useState, useRef, useEffect } from "react";
import { Project, Scene } from "../../../types";
import { apiService } from "../../../services/api";
import { ArrowLeft } from "lucide-react";
import "../../../engine/Engine.css";
import "./Preview.css";

interface PreviewProps {
  project: Project;
  onExitPreview: () => void;
}

const Preview: React.FC<PreviewProps> = ({ project, onExitPreview }) => {
  const [currentSceneName, setCurrentSceneName] = useState<string>("");
  const gameEngineRef = useRef<any>(null);
  const canvasId = "pace-canvas-preview";
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    const initializePreview = async () => {
      // Clean up any existing Engine instances first
      if (gameEngineRef.current && gameEngineRef.current.destroy) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }

      // Get server URL
      const url = await apiService.getResourceUrl("");
      setServerUrl(url);

      import("../../../engine/Engine.js")
        .then((module) => {
          const Engine = module.default || module;

          const canvas = document.getElementById(canvasId);
          if (canvas && !gameEngineRef.current) {
            gameEngineRef.current = new Engine(
              project,
              {},
              {
                canvasId: canvasId,
                serverUrl: url,
              },
            );

            // Set up scene change listener to update header
            const originalSetCurrentScene =
              gameEngineRef.current.setCurrentScene;
            gameEngineRef.current.setCurrentScene = function (
              scene: Scene | null,
            ) {
              setCurrentSceneName(scene ? scene.name : "");
              originalSetCurrentScene.call(this, scene);
            };

            // Set initial scene name
            if (project.scenes && project.scenes.length > 0) {
              setCurrentSceneName(project.scenes[0].name);
            }
          }
        })
        .catch(console.error);
    };

    initializePreview();

    return () => {
      if (gameEngineRef.current && gameEngineRef.current.destroy) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [project, canvasId]);

  if (!project.scenes || project.scenes.length === 0) {
    return (
      <div className="preview">
        <div className="preview-header">
          <button className="btn btn-secondary" onClick={onExitPreview}>
            <ArrowLeft size={16} /> Exit Preview
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-empty">
            <p>No scenes available to preview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <div className="preview-header">
        <div className="preview-title">
          <h1>{project.name}</h1>
          {currentSceneName && (
            <span className="preview-scene-name">/ {currentSceneName}</span>
          )}
        </div>
        <button className="btn btn-secondary" onClick={onExitPreview}>
          <ArrowLeft size={16} /> Exit Preview
        </button>
      </div>

      <div className="preview-content">
        <div id={canvasId} className="pace-canvas"></div>
      </div>
    </div>
  );
};

export default Preview;
