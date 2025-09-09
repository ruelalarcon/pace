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
  elements: Element[];
}

export interface Element {
  id: string;
  name: string;
  x: number; // Center position, relative (0-1)
  y: number; // Center position, relative (0-1)
  width: number; // Relative size (0-1)
  height: number; // Relative size (0-1)
  image?: string;
  destinationScene?: string; // Scene ID
  onClickText?: string;
  onClickSound?: string;
  onClickMusicChange?: string;
  highlightOnHover?: boolean;
  highlightColor?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'scene' | 'element';
  children?: TreeNode[];
  data?: Scene | Element;
}
