import { Scene } from './scene';

export interface Project {
  name: string;
  scenes: Scene[];
  createdAt: string;
}
