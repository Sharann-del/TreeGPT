import { TreeNode, TreeState } from '../types';

export interface Project {
  id: string;
  name: string;
  description: string;
  rootId: string | null;
  nodes: Map<string, TreeNode>;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isStarred: boolean;
}

const PROJECTS_STORAGE_KEY = 'treegpt_projects';
const CURRENT_PROJECT_KEY = 'treegpt_current_project';

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects.map(p => ({
    ...p,
    nodes: Array.from(p.nodes.entries())
  }))));
}

export function getAllProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((p: any) => ({
      ...p,
      nodes: new Map(p.nodes || [])
    }));
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered.map(p => ({
    ...p,
    nodes: Array.from(p.nodes.entries())
  }))));
}

export function createProjectFromState(state: TreeState, name: string, description = ''): Project {
  return {
    id: Math.random().toString(36).substring(7),
    name,
    description,
    rootId: state.rootId,
    nodes: new Map(state.nodes),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: [],
    isStarred: false,
  };
}

export function setCurrentProjectId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }
}

export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

