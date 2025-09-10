import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project, Scene, Element } from '../types';
import { ArrowLeft } from 'lucide-react';
import './GamePreview.css';

interface GamePreviewProps {
  project: Project;
  onExitPreview: () => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({ project, onExitPreview }) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(
    project.scenes.length > 0 ? project.scenes[0] : null
  );
  const [textboxVisible, setTextboxVisible] = useState(false);
  const [textboxContent, setTextboxContent] = useState('');
  const [textboxIndex, setTextboxIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [textLines, setTextLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const sceneTextTimerRef = useRef<number | null>(null);

  const sceneTextDelay = 300;

  // Update canvas rect on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      setCanvasRect(canvas.getBoundingClientRect());
    });

    resizeObserver.observe(canvas);
    setCanvasRect(canvas.getBoundingClientRect());

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentScene]);

  // Handle background music
  useEffect(() => {
    if (!currentScene) return;

    const newMusicUrl = currentScene.music ? `http://localhost:3001${currentScene.music}` : null;

    if (newMusicUrl) {
      // If music is already playing, do nothing
      if (audioRef.current && audioRef.current.src === newMusicUrl && !audioRef.current.paused) {
        return;
      }

      // Stop previous music if any
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play new music
      const audio = new Audio(newMusicUrl);
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(console.error);
      audioRef.current = audio;
    } else if (audioRef.current) {
      // If new scene has no music, stop current music
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [currentScene]);

  const navigateToScene = useCallback((sceneId: string) => {
    const targetScene = project.scenes.find(scene => scene.id === sceneId);
    if (targetScene) {
      setCurrentScene(targetScene);
    }
  }, [project.scenes]);

  const startTyping = useCallback((line: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setTextboxIndex(0);
    setIsTyping(true);

    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      index++;
      setTextboxIndex(index);
      if (index >= line.length) {
        setIsTyping(false);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 10);
  }, []);

  const showTextbox = useCallback((text: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    // If a scene text is pending, cancel it so it doesn't override this text
    if (sceneTextTimerRef.current !== null) {
      clearTimeout(sceneTextTimerRef.current);
      sceneTextTimerRef.current = null;
    }

    const lines = text
      .split('\n')
      .map(l => l)
      .filter(l => l.trim() !== '');

    if (lines.length === 0) {
      return;
    }

    setTextLines(lines);
    setCurrentLineIndex(0);
    setTextboxContent(lines[0]);
    startTyping(lines[0]);
    setTextboxVisible(true);
  }, [startTyping]);

  const hideTextbox = useCallback(() => {
    setTextboxVisible(false);
    setTextboxContent('');
    setTextboxIndex(0);
    setIsTyping(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setTextLines([]);
    setCurrentLineIndex(0);
  }, []);

  // Show scene text when scene changes
  useEffect(() => {
    // Clear any existing scheduled scene text
    if (sceneTextTimerRef.current !== null) {
      clearTimeout(sceneTextTimerRef.current);
      sceneTextTimerRef.current = null;
    }

    if (currentScene?.sceneText) {
      setPendingNavigation(null); // Abort any pending navigation from previous scene
      sceneTextTimerRef.current = window.setTimeout(() => {
        showTextbox(currentScene.sceneText!);
        sceneTextTimerRef.current = null;
      }, sceneTextDelay);
    }

    return () => {
      if (sceneTextTimerRef.current !== null) {
        clearTimeout(sceneTextTimerRef.current);
        sceneTextTimerRef.current = null;
      }
    };
  }, [currentScene, showTextbox]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);



  const handleElementClick = useCallback((element: Element) => {
    // Play click sound if specified
    if (element.onClickSound) {
      const audio = new Audio(`http://localhost:3001${element.onClickSound}`);
      audio.volume = 0.7;
      audio.play().catch(console.error);
    }

    // Change music if specified
    if (element.onClickMusicChange) {
      const newMusicUrl = `http://localhost:3001${element.onClickMusicChange}`;
      // Only change if the music is different from what's currently playing
      if (!audioRef.current || audioRef.current.src !== newMusicUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(newMusicUrl);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(console.error);
        audioRef.current = audio;
      }
    }

    setPendingNavigation(null); // Clear any previous pending navigation from another element

    const hasText = typeof element.onClickText === 'string' && element.onClickText.trim().length > 0;

    if (element.destinationScene) {
      if (hasText) {
        setPendingNavigation(element.destinationScene);
        showTextbox(element.onClickText!);
      } else {
        navigateToScene(element.destinationScene);
      }
    } else if (hasText) {
      showTextbox(element.onClickText!);
    }
  }, [navigateToScene, showTextbox]);

  const getAspectRatio = () => {
    if (currentScene && currentScene.aspectRatio) {
      const parts = currentScene.aspectRatio.split(':');
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

  const renderElement = (element: Element) => {
    if (!canvasRect) return null;

    const isHovered = hoveredElementId === element.id;
    const sceneAspectRatio = canvasRect.width / canvasRect.height;
    const elementHeight = element.scale;
    const elementWidth = (element.scale * element.aspectRatio) / sceneAspectRatio;

    const width = `${elementWidth * 100}%`;
    const height = `${elementHeight * 100}%`;

    // Apply highlight effect if enabled and hovered
    const highlightStyle: React.CSSProperties = {};
    if (isHovered && element.highlightOnHover) {
      highlightStyle.filter = `drop-shadow(0 0 8px ${element.highlightColor || '#ffffff'})`;
      highlightStyle.zIndex = 30;
    }

    return (
      <div
        key={element.id}
        className="preview-element"
        style={{
          left: `calc(${element.x * 100}% - (${width}) / 2)`,
          top: `calc(${element.y * 100}% - (${height}) / 2)`,
          width: width,
          height: height,
          borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : undefined,
          cursor: 'pointer',
          ...highlightStyle
        }}
        onClick={() => handleElementClick(element)}
        onMouseEnter={() => setHoveredElementId(element.id)}
        onMouseLeave={() => setHoveredElementId(null)}
      >
        {element.image ? (
          <img
            src={`http://localhost:3001${element.image}`}
            alt={element.name}
            className="preview-element-image"
            draggable={false}
          />
        ) : (
          <div className="preview-element-placeholder" />
        )}
      </div>
    );
  };

  const handleTextboxClick = () => {
    if (isTyping) {
      // Finish current line immediately
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      const fullLine = textLines[currentLineIndex] ?? textboxContent;
      setTextboxIndex(fullLine.length);
      setIsTyping(false);
    } else {
      // Advance to next non-empty line or finish
      const nextIndex = currentLineIndex + 1;
      if (nextIndex < textLines.length) {
        setCurrentLineIndex(nextIndex);
        setTextboxContent(textLines[nextIndex]);
        startTyping(textLines[nextIndex]);
      } else {
        hideTextbox();
        if (pendingNavigation) {
          navigateToScene(pendingNavigation);
          setPendingNavigation(null);
        }
      }
    }
  };

  if (!currentScene) {
    return (
      <div className="game-preview">
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
    <div className="game-preview">
      <div className="preview-header">
        <div className="preview-title">
          <h1>{project.name}</h1>
          <span className="preview-scene-name">/ {currentScene.name}</span>
        </div>
        <button className="btn btn-secondary" onClick={onExitPreview}>
          <ArrowLeft size={16} /> Exit Preview
        </button>
      </div>

      <div className="preview-content">
        <div
          ref={canvasRef}
          className="preview-canvas"
          style={{
            aspectRatio: getAspectRatio(),
            backgroundImage: currentScene.backgroundImage
              ? `url(http://localhost:3001${currentScene.backgroundImage})`
              : undefined
          }}
        >
          {currentScene.elements.map(renderElement)}

          {!currentScene.backgroundImage && (
            <div className="preview-canvas-placeholder">
              <p>No background image</p>
            </div>
          )}

          {textboxVisible && (
            <div className="preview-textbox" onClick={handleTextboxClick}>
              <div className="textbox-content">
                <p className="textbox-text">
                  {(textLines[currentLineIndex]?.substring(0, textboxIndex) || '\u00A0')}
                  {isTyping && <span className="typing-cursor" />}
                </p>
              </div>
              <div className="textbox-continue">
                <span>{isTyping ? 'Click to Fast Forward' : 'Click to Continue'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePreview;
