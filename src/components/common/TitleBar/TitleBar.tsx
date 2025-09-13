import React from "react";
import { Minimize2, Maximize, CircleX } from "lucide-react";
import "./TitleBar.css";

interface TitleBarProps {
  title?: string;
  showWindowControls?: boolean;
  subtitle?: string;
  currentScene?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({
  title = "PACE Editor",
  showWindowControls = true,
  subtitle,
  currentScene,
}) => {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-drag-region">
        <div className="title-bar-content">
          <div className="title-bar-left">
            <img
              src="./resources/logo.svg"
              alt="PACE Logo"
              className="title-bar-logo"
            />
            <div className="title-bar-text">
              <span className="title-bar-title">{title}</span>
              {(subtitle || currentScene) && (
                <span className="title-bar-subtitle">
                  {currentScene && `Scene: ${currentScene}`}
                  {subtitle && !currentScene && subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="title-bar-center">
            {/* Reserved for future menu items or breadcrumbs */}
          </div>

          <div className="title-bar-right">
            {showWindowControls && (
              <div className="window-controls">
                <button
                  className="window-control-btn minimize-btn"
                  onClick={handleMinimize}
                  title="Minimize"
                  tabIndex={-1}
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  className="window-control-btn maximize-btn"
                  onClick={handleMaximize}
                  title="Maximize"
                  tabIndex={-1}
                >
                  <Maximize size={14} />
                </button>
                <button
                  className="window-control-btn close-btn"
                  onClick={handleClose}
                  title="Close"
                  tabIndex={-1}
                >
                  <CircleX size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
