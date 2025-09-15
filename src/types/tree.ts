import { Element, Scene } from './scene';

export interface TreeNode {
  id: string;
  name: string;
  type: 'scene' | 'element';
  children?: TreeNode[];
  data?: Scene | Element;
}
