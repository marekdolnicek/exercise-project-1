import { create } from "zustand";
import {
  MonitoringTask,
  Entity,
  Source,
  Logic,
  createEmptyMonitoringTask,
  isTaskReady,
} from "@/lib/schemas/monitoring-task";
import { nanoid } from "nanoid";

interface MonitoringStore {
  // Current task being built
  task: MonitoringTask;

  // Computed state
  isReady: boolean;

  // Actions for updating scope
  setTopic: (topic: string) => void;
  setDescription: (description: string) => void;
  addKeywords: (keywords: string[]) => void;
  removeKeyword: (keyword: string) => void;
  addEntities: (entities: Entity[]) => void;
  removeEntity: (name: string) => void;
  setIntent: (intent: string) => void;

  // Actions for updating sources
  addSources: (sources: Omit<Source, "id">[]) => void;
  removeSource: (id: string) => void;
  toggleSource: (id: string) => void;
  updateSourcePriority: (id: string, priority: Source["priority"]) => void;

  // Actions for logic
  setLogic: (logic: Logic) => void;

  // Actions for task status
  markReady: () => void;
  reset: () => void;

  // Bulk update from agent
  updateFromAgent: (update: {
    topic?: string;
    description?: string;
    keywords?: string[];
    entities?: Entity[];
    intent?: string;
    sources?: Omit<Source, "id">[];
    logic?: Logic;
  }) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  task: createEmptyMonitoringTask(),
  isReady: false,

  // Scope actions
  setTopic: (topic) =>
    set((state) => {
      const newTask = {
        ...state.task,
        scope: { ...state.task.scope, topic },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  setDescription: (description) =>
    set((state) => {
      const newTask = {
        ...state.task,
        scope: { ...state.task.scope, description },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  addKeywords: (keywords) =>
    set((state) => {
      const existingKeywords = state.task.scope.keywords;
      const newKeywords = [...new Set([...existingKeywords, ...keywords])];
      const newTask = {
        ...state.task,
        scope: { ...state.task.scope, keywords: newKeywords },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  removeKeyword: (keyword) =>
    set((state) => {
      const newTask = {
        ...state.task,
        scope: {
          ...state.task.scope,
          keywords: state.task.scope.keywords.filter((k) => k !== keyword),
        },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  addEntities: (entities) =>
    set((state) => {
      const existingNames = state.task.scope.entities.map((e) => e.name);
      const newEntities = entities.filter((e) => !existingNames.includes(e.name));
      const newTask = {
        ...state.task,
        scope: {
          ...state.task.scope,
          entities: [...state.task.scope.entities, ...newEntities],
        },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  removeEntity: (name) =>
    set((state) => {
      const newTask = {
        ...state.task,
        scope: {
          ...state.task.scope,
          entities: state.task.scope.entities.filter((e) => e.name !== name),
        },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  setIntent: (intent) =>
    set((state) => {
      const newTask = {
        ...state.task,
        scope: { ...state.task.scope, intent },
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  // Source actions
  addSources: (sources) =>
    set((state) => {
      const newSources = sources.map((s) => ({
        ...s,
        id: nanoid(),
        enabled: true,
        priority: s.priority || "medium",
        updateFrequency: s.updateFrequency || "daily",
      })) as Source[];
      const newTask = {
        ...state.task,
        sources: [...state.task.sources, ...newSources],
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  removeSource: (id) =>
    set((state) => {
      const newTask = {
        ...state.task,
        sources: state.task.sources.filter((s) => s.id !== id),
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  toggleSource: (id) =>
    set((state) => {
      const newTask = {
        ...state.task,
        sources: state.task.sources.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        ),
      };
      return { task: newTask, isReady: isTaskReady(newTask) };
    }),

  updateSourcePriority: (id, priority) =>
    set((state) => {
      const newTask = {
        ...state.task,
        sources: state.task.sources.map((s) =>
          s.id === id ? { ...s, priority } : s
        ),
      };
      return { task: newTask };
    }),

  // Logic actions
  setLogic: (logic) =>
    set((state) => ({
      task: { ...state.task, logic },
    })),

  // Status actions
  markReady: () =>
    set((state) => ({
      task: { ...state.task, status: "ready" },
    })),

  reset: () =>
    set({
      task: createEmptyMonitoringTask(),
      isReady: false,
    }),

  // Bulk update from agent
  updateFromAgent: (update) =>
    set((state) => {
      const newTask = { ...state.task };

      if (update.topic) {
        newTask.scope = { ...newTask.scope, topic: update.topic };
      }
      if (update.description) {
        newTask.scope = { ...newTask.scope, description: update.description };
      }
      if (update.keywords) {
        const existingKeywords = newTask.scope.keywords;
        newTask.scope = {
          ...newTask.scope,
          keywords: [...new Set([...existingKeywords, ...update.keywords])],
        };
      }
      if (update.entities) {
        const existingNames = newTask.scope.entities.map((e) => e.name);
        const newEntities = update.entities.filter(
          (e) => !existingNames.includes(e.name)
        );
        newTask.scope = {
          ...newTask.scope,
          entities: [...newTask.scope.entities, ...newEntities],
        };
      }
      if (update.intent) {
        newTask.scope = { ...newTask.scope, intent: update.intent };
      }
      if (update.sources) {
        const newSources = update.sources.map((s) => ({
          ...s,
          id: nanoid(),
          enabled: true,
          priority: s.priority || "medium",
          updateFrequency: s.updateFrequency || "daily",
        })) as Source[];
        newTask.sources = [...newTask.sources, ...newSources];
      }
      if (update.logic) {
        newTask.logic = update.logic;
      }

      return { task: newTask, isReady: isTaskReady(newTask) };
    }),
}));
