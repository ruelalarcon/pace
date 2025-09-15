import React, { useEffect, useRef, useState } from 'react';

import { ArrowLeft } from 'lucide-react';

import '../../../engine/Engine.css';
import { apiService } from '../../../services/api';
import { Project, Scene } from '../../../types';
import './Preview.css';

interface PreviewProps {
  project: Project;
  initialSceneId?: string;
  onExitPreview: () => void;
}

const Preview: React.FC<PreviewProps> = ({
  project,
  onExitPreview,
  initialSceneId,
}) => {
  const [currentSceneName, setCurrentSceneName] = useState<string>('');
  const gameEngineRef = useRef<unknown>(null);
  const canvasId = 'pace-canvas-preview';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    const initializePreview = async () => {
      // Clean up any existing Engine instances first
      if (gameEngineRef.current && gameEngineRef.current.destroy) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }

      // Get server URL
      const url = await apiService.getResourceUrl('');
      setServerUrl(url);

      import('../../../engine/Engine.js')
        .then((module) => {
          const Engine = module.default || module;

          const canvas = document.getElementById(canvasId);
          if (canvas && !gameEngineRef.current) {
            gameEngineRef.current = new Engine(
              project,
              {},
              {
                canvasId,
                serverUrl: url,
                initialSceneId,
              },
            );

            // Set up scene change listener to update header
            const originalSetCurrentScene =
              gameEngineRef.current.setCurrentScene;
            gameEngineRef.current.setCurrentScene = function (
              scene: Scene | null,
            ) {
              setCurrentSceneName(scene ? scene.name : '');
              originalSetCurrentScene.call(this, scene);
            };

            // Set initial scene name
            if (project.scenes && project.scenes.length > 0) {
              let initialScene = project.scenes[0];

              // Use specific initial scene if provided
              if (initialSceneId) {
                const foundScene = project.scenes.find(
                  (scene) => scene.id === initialSceneId,
                );
                if (foundScene) {
                  initialScene = foundScene;
                }
              }

              setCurrentSceneName(initialScene.name);
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
  }, [project, canvasId, initialSceneId]);

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
