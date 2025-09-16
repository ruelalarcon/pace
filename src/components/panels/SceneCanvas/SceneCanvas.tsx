import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Image } from 'lucide-react';

import { apiService } from '../../../services/api';
import { Element, Scene } from '../../../types';
import './SceneCanvas.css';

interface SceneCanvasProps {
  scene: Scene | null;
  selectedElement: Element | null;
  onElementMove: (elementId: string, x: number, y: number) => void;
  onElementSelect: (element: Element) => void;
  onCanvasClick: () => void;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  selectedElement,
  onElementMove,
  onElementSelect,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [dragging, setDragging] = useState<{
    elementId: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [serverUrl, setServerUrl] = useState<string>('');

  const getAspectRatio = useCallback(() => {
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
  }, [scene]);

  const adjustCanvasSizeToAspect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const parentRect = canvas.parentElement.getBoundingClientRect();
    const availableWidth = parentRect.width;
    const availableHeight = parentRect.height;
    if (availableWidth === 0 || availableHeight === 0) return;

    const desiredAspect = getAspectRatio();
    const containerAspect = availableWidth / availableHeight;

    if (containerAspect > desiredAspect) {
      // Container is wider than desired; constrain by height
      canvas.style.height = '100%';
      canvas.style.width = 'auto';
    } else {
      // Container is narrower/taller; constrain by width
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
    }

    // Update canvas rect after size adjustment
    setCanvasRect(canvas.getBoundingClientRect());
  }, [getAspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      adjustCanvasSizeToAspect();
    });

    resizeObserver.observe(canvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initial size adjustment
    adjustCanvasSizeToAspect();

    return () => {
      resizeObserver.disconnect();
    };
  }, [scene, adjustCanvasSizeToAspect]);

  useEffect(() => {
    const initializeServerUrl = async () => {
      try {
        const url = await apiService.getResourceUrl('');
        setServerUrl(url);
      } catch (error) {
        console.error('Error getting server URL:', error);
      }
    };
    initializeServerUrl();
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, element: Element) => {
      e.stopPropagation();
      onElementSelect(element);

      if (!canvasRect) return;

      const sceneAspectRatio = canvasRect.width / canvasRect.height;
      const elementHeight = element.scale;
      const elementWidth =
        (element.scale * element.aspectRatio) / sceneAspectRatio;

      const elAbsX =
        element.x * canvasRect.width - (elementWidth * canvasRect.width) / 2;
      const elAbsY =
        element.y * canvasRect.height - (elementHeight * canvasRect.height) / 2;

      const offsetX = e.clientX - canvasRect.left - elAbsX;
      const offsetY = e.clientY - canvasRect.top - elAbsY;

      setDragging({
        elementId: element.id,
        offsetX,
        offsetY,
        startX: element.x,
        startY: element.y,
      });
    },
    [onElementSelect, canvasRect],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !canvasRect) return;

      const selectedEl = scene?.elements.find(
        (el) => el.id === dragging.elementId,
      );
      if (!selectedEl) return;

      const sceneAspectRatio = canvasRect.width / canvasRect.height;
      const elementHeight = selectedEl.scale;
      const elementWidth =
        (selectedEl.scale * selectedEl.aspectRatio) / sceneAspectRatio;

      const absX = e.clientX - canvasRect.left - dragging.offsetX;
      const absY = e.clientY - canvasRect.top - dragging.offsetY;

      const relX =
        (absX + (elementWidth * canvasRect.width) / 2) / canvasRect.width;
      const relY =
        (absY + (elementHeight * canvasRect.height) / 2) / canvasRect.height;

      setDragPosition({ x: relX, y: relY });
    },
    [dragging, scene, canvasRect],
  );

  const handleMouseUp = useCallback(() => {
    if (dragging && dragPosition) {
      onElementMove(dragging.elementId, dragPosition.x, dragPosition.y);
    }
    setDragging(null);
    setDragPosition(null);
  }, [dragging, dragPosition, onElementMove]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === canvasRef.current) {
      onCanvasClick();
    }
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElement?.id === element.id;
    const isHovered = hoveredElementId === element.id;
    const isDragging = dragging?.elementId === element.id;

    let width = '10%';
    let height = '10%';

    if (canvasRect) {
      const sceneAspectRatio = canvasRect.width / canvasRect.height;
      height = `${element.scale * 100}%`;
      width = `${((element.scale * element.aspectRatio) / sceneAspectRatio) * 100}%`;
    }

    const highlightStyle: React.CSSProperties = {};
    if (isHovered && element.highlightOnHover && !dragging) {
      highlightStyle.filter = `drop-shadow(0 0 8px ${element.highlightColor || '#ffffff'})`;
      highlightStyle.zIndex = 30;
    }

    const currentX = isDragging && dragPosition ? dragPosition.x : element.x;
    const currentY = isDragging && dragPosition ? dragPosition.y : element.y;

    return (
      <div
        key={element.id}
        className={`scene-element ${isSelected ? 'selected' : ''}`}
        style={{
          left: `calc(${currentX * 100}% - (${width}) / 2)`,
          top: `calc(${currentY * 100}% - (${height}) / 2)`,
          width,
          height,
          borderRadius: element.cornerRadius
            ? `${element.cornerRadius}px`
            : undefined,
          cursor: isDragging ? 'grabbing' : 'grab',
          ...highlightStyle,
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onMouseEnter={() => setHoveredElementId(element.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {element.image ? (
          <img
            src={`${serverUrl}${element.image}`}
            alt={element.name}
            className="element-image"
            draggable={false}
          />
        ) : (
          <div className="element-placeholder">
            <Image size={24} />
          </div>
        )}

        {isSelected && <div className="element-selection-outline" />}
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
          backgroundImage:
            scene.backgroundImage && serverUrl
              ? `url(${serverUrl}${scene.backgroundImage})`
              : undefined,
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
