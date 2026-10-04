import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { createWorkspaceApi } from '../api/workspaceApi';
import { createProjectApi } from '../api/resourceApis';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, workspaces } = useAuth();
  const [currentWorkspace, setCurrentWorkspaceState] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Restore current workspace from localStorage
  useEffect(() => {
    if (!user || workspaces.length === 0) return;

    const stored = localStorage.getItem('taskflow_current_workspace');
    if (stored) {
      try {
        const ws = JSON.parse(stored);
        const found = workspaces.find(w => w.id === ws.id);
        if (found) {
          setCurrentWorkspaceState({ ...found, ...ws });
          return;
        }
      } catch (_) {}
    }

    const personal = workspaces.find(w => w.type === 'personal') || workspaces[0];
    if (personal) setCurrentWorkspaceState(personal);
  }, [user, workspaces]);

  const loadProjects = useCallback(async () => {
    if (!currentWorkspace || !user) return;
    setIsLoadingProjects(true);
    try {
      const api = createProjectApi(user.id);
      const data = await api.getProjects(currentWorkspace.id);
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [currentWorkspace?.id, user?.id]);

  const loadMembers = useCallback(async () => {
    if (!currentWorkspace || !user) return;
    setIsLoadingMembers(true);
    try {
      const api = createWorkspaceApi(user.id);
      const data = await api.getMembers(currentWorkspace.id);
      setMembers(data);
    } catch (e) {
      console.error('Failed to load workspace members:', e);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [currentWorkspace?.id, user?.id]);

  // Load projects & members when workspace changes
  useEffect(() => {
    if (!currentWorkspace || !user) return;
    loadProjects();
    loadMembers();
  }, [currentWorkspace?.id, user?.id, loadProjects, loadMembers]);

  const switchWorkspace = (ws) => {
    setCurrentWorkspaceState(ws);
    setProjects([]);
    setMembers([]);
    localStorage.setItem('taskflow_current_workspace', JSON.stringify(ws));
  };

  const inviteMember = async (email, role = 'member') => {
    if (!currentWorkspace || !user) return { success: false, message: 'No active workspace.' };
    try {
      const api = createWorkspaceApi(user.id);
      const data = await api.inviteMember(currentWorkspace.id, email);
      await loadMembers();
      return { success: true, message: 'Invitation created!', data };
    } catch (e) {
      return { success: false, message: e.message || 'Failed to invite member.' };
    }
  };

  const removeMember = async (memberUserId) => {
    if (!currentWorkspace || !user) return { success: false, message: 'No active workspace.' };
    try {
      const api = createWorkspaceApi(user.id);
      await api.removeMember(currentWorkspace.id, memberUserId);
      setMembers(prev => prev.filter(m => m.id !== memberUserId));
      return { success: true, message: 'Member removed.' };
    } catch (e) {
      return { success: false, message: e.message || 'Failed to remove member.' };
    }
  };

  const addProject = (proj) => {
    setProjects(prev => [...prev, proj]);
  };

  const updateProject = (proj) => {
    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
  };

  const removeProject = (projId) => {
    setProjects(prev => prev.filter(p => p.id !== projId));
  };

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      projects,
      members,
      isLoadingProjects,
      isLoadingMembers,
      switchWorkspace,
      loadProjects,
      loadMembers,
      inviteMember,
      removeMember,
      addProject,
      updateProject,
      removeProject,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
