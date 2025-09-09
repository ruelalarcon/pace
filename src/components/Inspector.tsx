import React, { useState } from 'react';
import { Scene, Element } from '../types';
import FileUpload from './FileUpload';
import './Inspector.css';

interface InspectorProps {
  selectedItem: Scene | Element | null;
  selectedItemType: 'scene' | 'element' | null;
  scenes: Scene[];
  onUpdateScene: (scene: Scene) => void;
  onUpdateElement: (element: Element) => void;
  onDeleteItem: (id: string, type: 'scene' | 'element') => void;
  projectName: string;
}

const Inspector: React.FC<InspectorProps> = ({
  selectedItem,
  selectedItemType,
  scenes,
  onUpdateScene,
  onUpdateElement,
  onDeleteItem,
  projectName
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const getLocalValue = (key: string, defaultValue: any) => {
    return localValues[key] !== undefined ? localValues[key] : defaultValue;
  };

  const setLocalValue = (key: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const commitLocalValue = (key: string) => {
    const value = localValues[key];
    if (value === undefined) return;

    if (selectedItemType === 'scene' && selectedItem) {
      const scene = selectedItem as Scene;
      onUpdateScene({ ...scene, [key]: value });
    } else if (selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, [key]: value });
    }

    // Clear local value after committing
    const newLocalValues = { ...localValues };
    delete newLocalValues[key];
    setLocalValues(newLocalValues);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectName}/upload`, {
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
      onUpdateElement({ ...element, image: imagePath });
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
      <div className="property-group" title="The name of the scene.">
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
      </div>
      <div className="property-group" title="The aspect ratio of the scene, e.g., 16:9, 4:3.">
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
      </div>
      <div className="property-group" title="The background image for the scene.">
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
      </div>
      <div className="property-group" title="Music that plays when this scene is active.">
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
      </div>
      <div className="property-group" title="Text that displays in a textbox when the scene is entered.">
        <label className="property-label">Scene Text</label>
        <textarea
          className="input property-input"
          value={getLocalValue('sceneText', scene.sceneText || '')}
          onChange={(e) => setLocalValue('sceneText', e.target.value)}
          onBlur={() => commitLocalValue('sceneText')}
          rows={4}
        />
      </div>
    </div>
  );

  const renderElementProperties = (element: Element) => (
    <div className="inspector-properties">
      <div className="property-group" title="The name of the element.">
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
      </div>

      <div className="property-group-row">
        <div className="property-group" title="The horizontal position of the element's center, relative to the scene width (0 to 1).">
          <label className="property-label">X Position</label>
          <input
            type="number"
            step="0.01"
            className="input property-input"
            value={getLocalValue('x', element.x)}
            onChange={(e) => setLocalValue('x', parseFloat(e.target.value) || 0)}
            onBlur={() => commitLocalValue('x')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('x');
              }
            }}
          />
        </div>

        <div className="property-group" title="The vertical position of the element's center, relative to the scene height (0 to 1).">
          <label className="property-label">Y Position</label>
          <input
            type="number"
            step="0.01"
            className="input property-input"
            value={getLocalValue('y', element.y)}
            onChange={(e) => setLocalValue('y', parseFloat(e.target.value) || 0)}
            onBlur={() => commitLocalValue('y')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('y');
              }
            }}
          />
        </div>
      </div>

      <div className="property-group-row">
        <div className="property-group" title="The width of the element, relative to the scene width (0 to 1).">
          <label className="property-label">Width</label>
          <input
            type="number"
            step="0.01"
            className="input property-input"
            value={getLocalValue('width', element.width)}
            onChange={(e) => setLocalValue('width', parseFloat(e.target.value) || 0)}
            onBlur={() => commitLocalValue('width')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('width');
              }
            }}
          />
        </div>

        <div className="property-group" title="The height of the element, relative to the scene height (0 to 1).">
          <label className="property-label">Height</label>
          <input
            type="number"
            step="0.01"
            className="input property-input"
            value={getLocalValue('height', element.height)}
            onChange={(e) => setLocalValue('height', parseFloat(e.target.value) || 0)}
            onBlur={() => commitLocalValue('height')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commitLocalValue('height');
              }
            }}
          />
        </div>
      </div>

      <div className="property-group" title="The image for the element.">
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
      </div>

      <div className="property-group" title="The scene to go to when this element is clicked.">
        <label className="property-label">Destination Scene</label>
        <select
          className="input property-input"
          value={element.destinationScene || ''}
          onChange={(e) => onUpdateElement({ ...element, destinationScene: e.target.value })}
        >
          <option value="">None</option>
          {scenes.map(scene => (
            <option key={scene.id} value={scene.id}>
              {scene.name}
            </option>
          ))}
        </select>
      </div>

      <div className="property-group" title="Text that displays when the element is clicked.">
        <label className="property-label">On-Click Text</label>
        <textarea
          className="input property-input"
          value={getLocalValue('onClickText', element.onClickText || '')}
          onChange={(e) => setLocalValue('onClickText', e.target.value)}
          onBlur={() => commitLocalValue('onClickText')}
          rows={4}
        />
      </div>

      <div className="property-group" title="A sound that plays when the element is clicked.">
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
      </div>

      <div className="property-group" title="Change the music when the element is clicked.">
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
      </div>

      <div className="property-group-row" title="If enabled, the element will glow when the mouse is over it.">
        <label className="property-label-row">Highlight on Hover</label>
        <input
          type="checkbox"
          checked={element.highlightOnHover}
          onChange={(e) => onUpdateElement({ ...element, highlightOnHover: e.target.checked })}
        />
      </div>

      <div className="property-group-row" title="The color of the highlight glow.">
        <label className="property-label-row">Highlight Color</label>
        <input
          type="color"
          className="input-color"
          value={element.highlightColor || '#ffffff'}
          disabled={!element.highlightOnHover}
          onChange={(e) => onUpdateElement({ ...element, highlightColor: e.target.value })}
        />
      </div>
    </div>
  );

  const handleDelete = () => {
    if (selectedItem && selectedItemType) {
      onDeleteItem(selectedItem.id, selectedItemType);
      setIsDeleteConfirmVisible(false);
    }
  };

  if (!selectedItem || !selectedItemType) {
    return (
      <div className="inspector">
        <div className="inspector-header">
          <h2 className="inspector-title">Inspector</h2>
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
          {selectedItemType === 'scene' ? '🎬' : '📦'} {selectedItem.name}
        </div>
      </div>
      <div className="inspector-content">
        {selectedItemType === 'scene'
          ? renderSceneProperties(selectedItem as Scene)
          : renderElementProperties(selectedItem as Element)
        }

        <div className="inspector-actions">
          <button
            className="btn btn-danger"
            onClick={() => setIsDeleteConfirmVisible(true)}
          >
            Delete {selectedItemType}
          </button>
        </div>
      </div>

      {isDeleteConfirmVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Deletion</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeleteConfirmVisible(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspector;
