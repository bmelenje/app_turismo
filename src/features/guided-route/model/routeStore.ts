import { create } from 'zustand';
import type { Route } from '@/entities/route';

interface GuidedRouteStore {
  activeRoute: Route | null;
  currentStepIndex: number;
  isActive: boolean;
  startRoute: (route: Route) => void;
  nextStep: () => void;
  prevStep: () => void;
  stopRoute: () => void;
}

export const useGuidedRouteStore = create<GuidedRouteStore>((set, get) => ({
  activeRoute: null,
  currentStepIndex: 0,
  isActive: false,

  startRoute: (route) => set({ activeRoute: route, currentStepIndex: 0, isActive: true }),

  nextStep: () => {
    const { currentStepIndex, activeRoute } = get();
    if (!activeRoute) return;
    const max = activeRoute.steps.length - 1;
    set({ currentStepIndex: Math.min(currentStepIndex + 1, max) });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    set({ currentStepIndex: Math.max(currentStepIndex - 1, 0) });
  },

  stopRoute: () => set({ activeRoute: null, currentStepIndex: 0, isActive: false }),
}));
