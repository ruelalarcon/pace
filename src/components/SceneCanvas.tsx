import React, { useRef, useState, useCallback } from 'react';
import { Scene, Element } from '../types';
import './SceneCanvas.css';

interface SceneCanvasProps {
  scene: Scene | null;
  selectedElement: Element | null;
  onElementMove: (elementId: string, x: number, y: number) => void;
  onCanvasClick: () => void;
  projectName: string;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  selectedElement,
  onElementMove,
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
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left - element.x;
    const offsetY = e.clientY - rect.top - element.y;

    setDragging({
      elementId: element.id,
      offsetX,
      offsetY
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragging.offsetX);
    const y = Math.max(0, e.clientY - rect.top - dragging.offsetY);

    onElementMove(dragging.elementId, x, y);
  }, [dragging, onElementMove]);

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
          left: element.x,
          top: element.y,
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

  return (
    <div className="scene-canvas-container">
      <div
        ref={canvasRef}
        className="scene-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{
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
