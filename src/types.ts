export interface Project {
  name: string;
  scenes: Scene[];
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  backgroundImage?: string;
  aspectRatio: string; // e.g., "16:9"
  music?: string;
  sceneText?: string;
  newSceneAfterText?: string; // Scene ID to navigate to after scene text completes
  elements: Element[];
}

export interface Element {
  id: string;
  name: string;
  x: number; // Center position, relative (0-1)
  y: number; // Center position, relative (0-1)
  scale: number; // Relative size (0-1)
  aspectRatio: number; // width / height
  image?: string;
  destinationScene?: string; // Scene ID
  onClickText?: string;
  onClickSound?: string;
  onClickMusicChange?: string;
  highlightOnHover?: boolean;
  highlightColor?: string;
  cornerRadius?: number; // Border radius in pixels
}

export interface TreeNode {
  id: string;
  name: string;
  type: "scene" | "element";
  children?: TreeNode[];
  data?: Scene | Element;
}
