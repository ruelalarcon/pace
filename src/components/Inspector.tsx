import React, { useState } from 'react';
import { Scene, Element } from '../types';
import FileUpload from './FileUpload';
import './Inspector.css';

interface InspectorProps {
  selectedItem: Scene | Element | null;
  selectedItemType: 'scene' | 'element' | null;
  onUpdateScene: (scene: Scene) => void;
  onUpdateElement: (element: Element) => void;
  onDeleteItem: (id: string, type: 'scene' | 'element') => void;
  projectName: string;
}

const Inspector: React.FC<InspectorProps> = ({
  selectedItem,
  selectedItemType,
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

  const handleElementImageUpload = async (file: File) => {
    const imagePath = await handleFileUpload(file);
    if (imagePath && selectedItemType === 'element' && selectedItem) {
      const element = selectedItem as Element;
      onUpdateElement({ ...element, image: imagePath });
    }
  };

  const renderSceneProperties = (scene: Scene) => (
    <div className="inspector-properties">
      <div className="property-group">
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
      <div className="property-group">
        <label className="property-label">Background Image</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleBackgroundImageUpload}
            accept="image/*"
            label="Choose Image"
          />
          {scene.backgroundImage && (
            <div className="image-preview">
              <img
                src={`http://localhost:3001${scene.backgroundImage}`}
                alt="Background"
                className="preview-image"
              />
              <p className="image-path">{scene.backgroundImage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderElementProperties = (element: Element) => (
    <div className="inspector-properties">
      <div className="property-group">
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

      <div className="property-group">
        <label className="property-label">X Position</label>
        <input
          type="number"
          className="input property-input"
          value={getLocalValue('x', element.x)}
          onChange={(e) => setLocalValue('x', parseInt(e.target.value) || 0)}
          onBlur={() => commitLocalValue('x')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              commitLocalValue('x');
            }
          }}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Y Position</label>
        <input
          type="number"
          className="input property-input"
          value={getLocalValue('y', element.y)}
          onChange={(e) => setLocalValue('y', parseInt(e.target.value) || 0)}
          onBlur={() => commitLocalValue('y')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              commitLocalValue('y');
            }
          }}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Image</label>
        <div className="property-value">
          <FileUpload
            onFileUpload={handleElementImageUpload}
            accept="image/*"
            label="Choose Image"
          />
          {element.image && (
            <div className="image-preview">
              <img
                src={`http://localhost:3001${element.image}`}
                alt="Element"
                className="preview-image"
              />
              <p className="image-path">{element.image}</p>
            </div>
          )}
        </div>
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
