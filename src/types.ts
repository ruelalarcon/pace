export interface Project {
  name: string;
  scenes: Scene[];
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  backgroundImage?: string;
  elements: Element[];
}

export interface Element {
  id: string;
  name: string;
  x: number;
  y: number;
  image?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'scene' | 'element';
  children?: TreeNode[];
  data?: Scene | Element;
}
