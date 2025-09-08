import React, { useRef, useState, useCallback } from 'react';
import { Scene, Element } from '../types';
import './SceneCanvas.css';

interface SceneCanvasProps {
  scene: Scene | null;
  selectedElement: Element | null;
  onElementMove: (elementId: string, x: number, y: number) => void;
  onElementSelect: (element: Element) => void;
  onCanvasClick: () => void;
  projectName: string;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  selectedElement,
  onElementMove,
  onElementSelect,
  onCanvasClick,
  projectName
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    elementId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    onElementSelect(element);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const elAbsX = element.x * canvasRect.width - (element.width * canvasRect.width / 2);
    const elAbsY = element.y * canvasRect.height - (element.height * canvasRect.height / 2);

    const offsetX = e.clientX - canvasRect.left - elAbsX;
    const offsetY = e.clientY - canvasRect.top - elAbsY;

    setDragging({
      elementId: element.id,
      offsetX,
      offsetY
    });
  }, [onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const selectedEl = scene?.elements.find(el => el.id === dragging.elementId);
    if (!selectedEl) return;

    const absX = e.clientX - canvasRect.left - dragging.offsetX;
    const absY = e.clientY - canvasRect.top - dragging.offsetY;

    const relX = (absX + (selectedEl.width * canvasRect.width / 2)) / canvasRect.width;
    const relY = (absY + (selectedEl.height * canvasRect.height / 2)) / canvasRect.height;

    onElementMove(dragging.elementId, relX, relY);
  }, [dragging, onElementMove, scene]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onCanvasClick();
    }
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElement?.id === element.id;

    return (
      <div
        key={element.id}
        className={`scene-element ${isSelected ? 'selected' : ''}`}
        style={{
          left: `calc(${element.x * 100}% - ${element.width * 100 / 2}%)`,
          top: `calc(${element.y * 100}% - ${element.height * 100 / 2}%)`,
          width: `${element.width * 100}%`,
          height: `${element.height * 100}%`,
          cursor: dragging?.elementId === element.id ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
      >
        {element.image ? (
          <img
            src={`http://localhost:3001${element.image}`}
            alt={element.name}
            className="element-image"
            draggable={false}
          />
        ) : (
          <div className="element-placeholder">
            <span className="element-name">{element.name}</span>
          </div>
        )}

        {isSelected && (
          <div className="element-selection-outline" />
        )}
      </div>
    );
  };

  if (!scene) {
    return (
      <div className="scene-canvas-container">
        <div className="scene-canvas-empty">
          <p>No scene selected. Create a scene to start editing.</p>
        </div>
      </div>
    );
  }

  const getAspectRatio = () => {
    if (scene && scene.aspectRatio) {
      const parts = scene.aspectRatio.split(':');
      if (parts.length === 2) {
        const width = parseFloat(parts[0]);
        const height = parseFloat(parts[1]);
        if (!isNaN(width) && !isNaN(height) && height > 0) {
          return width / height;
        }
      }
    }
    return 16 / 9; // Default aspect ratio
  };

  return (
    <div
      className="scene-canvas-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={canvasRef}
        className="scene-canvas"
        onClick={handleCanvasClick}
        style={{
          aspectRatio: getAspectRatio(),
          backgroundImage: scene.backgroundImage
            ? `url(http://localhost:3001${scene.backgroundImage})`
            : undefined
        }}
      >
        {scene.elements.map(renderElement)}

        {!scene.backgroundImage && (
          <div className="canvas-placeholder">
            <p>Click on the scene in the inspector to set a background image</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneCanvas;
