import React, { useState } from 'react';
import { Scene, Element } from '../types';
import FileUpload from './FileUpload';
import { Clapperboard, Box, ChevronDown, Info } from 'lucide-react';
import './Inspector.css';

interface InspectorProps {
  selectedItem: Scene | Element | null;
  selectedItemType: 'scene' | 'element' | null;
  scenes: Scene[];
  onUpdateScene: (scene: Scene) => void;
  onUpdateElement: (element: Element) => void;
  projectName: string;
  currentSceneId?: string | null;
}

const Inspector: React.FC<InspectorProps> = ({
  selectedItem,
  selectedItemType,
  scenes,
  onUpdateScene,
  onUpdateElement,
  projectName,
  currentSceneId
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  const getLocalValue = (key: string, defaultValue: any) => {
    return localValues[key] !== undefined ? localValues[key] : defaultValue;
  };

  const setLocalValue = (key: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const commitLocalValue = (key: string) => {
    const value = localValues[key];
    if (value === undefined) return;

    let nextValue: any = value;

    // Coerce numeric fields on commit only
    if (selectedItemType === 'element') {
      const element = selectedItem as Element | null;
      if (['x', 'y', 'scale'].includes(key)) {
        const parsed = parseFloat(String(value).trim());
        nextValue = isNaN(parsed) ? (element && (element as any)[key]) ?? 0 : parsed;
      } else if (key === 'cornerRadius') {
        const parsed = parseInt(String(value).trim(), 10);
        const safe = isNaN(parsed) ? (element && (element as any)[key]) ?? 0 : Math.max(0, parsed);
        nextValue = safe;
      }
    }

    if (selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, [key]: nextValue });
    } else if (selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, [key]: nextValue });
    }

    const newLocalValues = { ...localValues };
    delete newLocalValues[key];
    setLocalValues(newLocalValues);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${encodeURIComponent(projectName)}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result.path;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    const imagePath = await handleFileUpload(file);
    if (imagePath && selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, backgroundImage: imagePath });
    }
  };

  const handleRemoveBackgroundImage = () => {
    if (selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, backgroundImage: '' });
    }
  };

  const handleMusicUpload = async (file: File) => {
    const musicPath = await handleFileUpload(file);
    if (musicPath && selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, music: musicPath });
    }
  };

  const handleRemoveMusic = () => {
    if (selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, music: '' });
    }
  };

  const handleElementImageUpload = async (file: File) => {
    const imagePath = await handleFileUpload(file);
    if (imagePath && selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;

      const img = new Image();
      img.onload = () => {
        const imageAspectRatio = img.width / img.height;

        onUpdateElement({
          ...element,
          image: imagePath,
          scale: 0.2,
          aspectRatio: imageAspectRatio,
        });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleRemoveElementImage = () => {
    if (selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, image: '' });
    }
  };

  const handleSoundUpload = async (file: File) => {
    const soundPath = await handleFileUpload(file);
    if (soundPath && selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, onClickSound: soundPath });
    }
  };

  const handleRemoveSound = () => {
    if (selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, onClickSound: '' });
    }
  };

  const handleMusicChangeUpload = async (file: File) => {
    const musicPath = await handleFileUpload(file);
    if (musicPath && selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, onClickMusicChange: musicPath });
    }
  };

  const handleRemoveMusicChange = () => {
    if (selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, onClickMusicChange: '' });
    }
  };

  const renderSceneProperties = (scene: Scene) => (
    <div className="inspector-properties">
      <div className="property-group has-tooltip">
        <label className="property-label">Name</label>
        <input
          type="text"
          className="input property-input"
          value={getLocalValue('name', scene.name)}
          onChange={(e) => setLocalValue('name', e.target.value)}
          onBlur={() => commitLocalValue('name')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              commitLocalValue('name');
            }
          }}
        />
        <div className="field-tooltip">The name of the scene.</div>
      </div>
      <div className="property-group has-tooltip">
        <label className="property-label">Aspect Ratio</label>
        <input
          type="text"
          className="input property-input"
          value={getLocalValue('aspectRatio', scene.aspectRatio)}
          onChange={(e) => setLocalValue('aspectRatio', e.target.value)}
          onBlur={() => commitLocalValue('aspectRatio')}
          placeholder="e.g., 16:9"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              commitLocalValue('aspectRatio');
            }
          }}
        />
        <div className="field-tooltip">The aspect ratio of the scene (e.g., 16:9, 4:3).</div>
      </div>
      <div className="property-group has-tooltip">
        <label className="property-label">Background Image</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleBackgroundImageUpload}
            accept="image/*"
            label="Choose Image"
          />
          {scene.backgroundImage && (
            <div className="file-info">
              <div className="image-preview">
                <img
                  src={`http://localhost:3001${scene.backgroundImage}`}
                  alt="Background"
                  className="preview-image"
                />
              </div>
              <p className="file-path">{scene.backgroundImage}</p>
              <button onClick={handleRemoveBackgroundImage} className="btn-remove-file">&times;</button>
            </div>
          )}
        </div>
        <div className="field-tooltip">The background image displayed for this scene.</div>
      </div>
      <div className="property-group has-tooltip">
        <label className="property-label">Music</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleMusicUpload}
            accept="audio/*"
            label="Choose Music"
          />
          {scene.music && (
            <div className="file-info">
              <p className="file-path">{scene.music}</p>
              <button onClick={handleRemoveMusic} className="btn-remove-file">&times;</button>
            </div>
          )}
        </div>
        <div className="field-tooltip">Music that plays when this scene is active.</div>
      </div>
      <div className="property-group has-tooltip">
        <label className="property-label">Scene Text</label>
        <textarea
          className="input property-input"
          value={getLocalValue('sceneText', scene.sceneText || '')}
          onChange={(e) => setLocalValue('sceneText', e.target.value)}
          onBlur={() => commitLocalValue('sceneText')}
          rows={4}
        />
        <div className="field-tooltip">Text that displays in a textbox when the scene is entered.</div>
      </div>
    </div>
  );

  const renderElementProperties = (element: Element) => (
    <div className="inspector-properties">
      <div className="property-group has-tooltip">
        <label className="property-label">Name</label>
        <input
          type="text"
          className="input property-input"
          value={getLocalValue('name', element.name)}
          onChange={(e) => setLocalValue('name', e.target.value)}
          onBlur={() => commitLocalValue('name')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              commitLocalValue('name');
            }
          }}
        />
        <div className="field-tooltip">The name of the element.</div>
      </div>

      <div className="property-group-row">
        <div className="property-group has-tooltip">
          <label className="property-label">X Position</label>
          <input
            type="text"
            className="input property-input"
            value={String(getLocalValue('x', element.x))}
            onChange={(e) => setLocalValue('x', e.target.value)}
            onBlur={() => commitLocalValue('x')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('x');
              }
            }}
          />
          <div className="field-tooltip">Horizontal center position (0 to 1).</div>
        </div>

        <div className="property-group has-tooltip">
          <label className="property-label">Y Position</label>
          <input
            type="text"
            className="input property-input"
            value={String(getLocalValue('y', element.y))}
            onChange={(e) => setLocalValue('y', e.target.value)}
            onBlur={() => commitLocalValue('y')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('y');
              }
            }}
          />
          <div className="field-tooltip">Vertical center position (0 to 1).</div>
        </div>
      </div>

      <div className="property-group-row">
        <div className="property-group has-tooltip">
          <label className="property-label">Scale</label>
          <input
            type="text"
            className="input property-input"
            value={String(getLocalValue('scale', element.scale))}
            onChange={(e) => setLocalValue('scale', e.target.value)}
            onBlur={() => commitLocalValue('scale')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('scale');
              }
            }}
          />
          <div className="field-tooltip">Relative height of the element (1 = full scene height).</div>
        </div>

        <div className="property-group has-tooltip">
          <label className="property-label">Corner Radius</label>
          <input
            type="text"
            className="input property-input"
            value={String(getLocalValue('cornerRadius', element.cornerRadius ?? 0))}
            onChange={(e) => setLocalValue('cornerRadius', e.target.value)}
            onBlur={() => commitLocalValue('cornerRadius')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('cornerRadius');
              }
            }}
          />
          <div className="field-tooltip">Corner radius in pixels applied to the element.</div>
        </div>
      </div>

      <div className="property-group has-tooltip">
        <label className="property-label">Image</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleElementImageUpload}
            accept="image/*"
            label="Choose Image"
          />
          {element.image && (
            <div className="file-info">
              <div className="image-preview">
                <img
                  src={`http://localhost:3001${element.image}`}
                  alt="Element"
                  className="preview-image"
                />
              </div>
              <p className="file-path">{element.image}</p>
              <button onClick={handleRemoveElementImage} className="btn-remove-file">&times;</button>
            </div>
          )}
        </div>
        <div className="field-tooltip">The image to display for this element.</div>
      </div>

      <div className="property-group has-tooltip">
        <label className="property-label">Destination Scene</label>
        <div className="select-wrapper">
          <select
            className="input select"
            value={element.destinationScene || ''}
            onChange={(e) => onUpdateElement({ ...element, destinationScene: e.target.value })}
          >
            <option value="">None</option>
            {scenes
              .filter(scene => scene.id !== currentSceneId)
              .map(scene => (
              <option key={scene.id} value={scene.id}>
                {scene.name}
              </option>
            ))}
          </select>
          <div className="select-arrow">
            <ChevronDown size={16} />
          </div>
        </div>
        <div className="field-tooltip">The scene to navigate to when this element is clicked.</div>
      </div>

      <div className="property-group has-tooltip">
        <label className="property-label">On-Click Text</label>
        <textarea
          className="input property-input"
          value={getLocalValue('onClickText', element.onClickText || '')}
          onChange={(e) => setLocalValue('onClickText', e.target.value)}
          onBlur={() => commitLocalValue('onClickText')}
          rows={4}
        />
        <div className="field-tooltip">Text that displays when the element is clicked.</div>
      </div>

      <div className="property-group has-tooltip">
        <label className="property-label">On-Click Sound</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleSoundUpload}
            accept="audio/*"
            label="Choose Sound"
          />
          {element.onClickSound && (
            <div className="file-info">
              <p className="file-path">{element.onClickSound}</p>
              <button onClick={handleRemoveSound} className="btn-remove-file">&times;</button>
            </div>
          )}
        </div>
        <div className="field-tooltip">A sound that plays when the element is clicked.</div>
      </div>

      <div className="property-group has-tooltip">
        <label className="property-label">On-Click Music Change</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleMusicChangeUpload}
            accept="audio/*"
            label="Choose Music"
          />
          {element.onClickMusicChange && (
            <div className="file-info">
              <p className="file-path">{element.onClickMusicChange}</p>
              <button onClick={handleRemoveMusicChange} className="btn-remove-file">&times;</button>
            </div>
          )}
        </div>
        <div className="field-tooltip">Change the music when the element is clicked.</div>
      </div>

      <div className="property-group-row has-tooltip">
        <label className="property-label-row switch-label" htmlFor={`highlight-${element.id}`}>Highlight on Hover</label>
        <label className="switch" htmlFor={`highlight-${element.id}`}>
          <input
            type="checkbox"
            id={`highlight-${element.id}`}
            checked={element.highlightOnHover}
            onChange={(e) => onUpdateElement({ ...element, highlightOnHover: e.target.checked })}
          />
          <span className="switch-slider"></span>
        </label>
        <div className="field-tooltip">If enabled, the element will glow when hovered.</div>
      </div>

      <div className="property-group-row has-tooltip">
        <label className="property-label-row">Highlight Color</label>
        <div className="color-picker-wrapper">
          <input
            type="color"
            className="input-color"
            value={element.highlightColor || '#ffffff'}
            disabled={!element.highlightOnHover}
            onChange={(e) => onUpdateElement({ ...element, highlightColor: e.target.value })}
          />
        </div>
        <div className="field-tooltip">The color of the highlight glow.</div>
      </div>
    </div>
  );

  if (!selectedItem || !selectedItemType) {
    return (
      <div className="inspector">
        <div className="inspector-header">
          <h2 className="inspector-title">Inspector</h2>
          <div className="inspector-subtitle">
            <Info size={14} /> No object selected
          </div>
        </div>
        <div className="inspector-content">
          <div className="inspector-empty">
            <p>Select a scene or element to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inspector">
      <div className="inspector-header">
        <h2 className="inspector-title">Inspector</h2>
        <div className="inspector-subtitle">
          {selectedItemType === 'scene' ? (
            <Clapperboard size={14} />
          ) : (
            <Box size={14} />
          )} {selectedItem.name}
        </div>
      </div>
      <div className="inspector-content">
        {selectedItemType === 'scene'
          ? renderSceneProperties(selectedItem as Scene)
          : renderElementProperties(selectedItem as Element)
        }
      </div>
    </div>
  );
};

export default Inspector;
