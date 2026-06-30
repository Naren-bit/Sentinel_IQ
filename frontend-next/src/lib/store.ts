import { create } from 'zustand';

export interface Detection {
  detectionId: string;
  text: string;
  type: string;
  priorityTier: 'HIGH' | 'STANDARD' | 'LOW';
  reasons: string[];
  drivingSignal?: string;
  start?: number;
  end?: number;
  confidence?: number;
  source?: string;
}

interface AppState {
  currentScreen: 'landing' | 'upload' | 'review' | 'complete';
  documentName: string;
  documentText: string;
  detections: Detection[];
  loading: boolean;
  error: string | null;
  reviewedIds: Set<string>;
  viewEnteredAt: number | null;
  fallbackOccurred: boolean;
  
  setScreen: (screen: 'landing' | 'upload' | 'review' | 'complete') => void;
  setReviewData: (data: { name: string; text: string; detections: Detection[], fallbackOccurred?: boolean }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markReviewed: (id: string) => void;
  bulkApprove: () => void;
  reset: () => void;
  setViewEnteredAt: (time: number) => void;
}

export const useStore = create<AppState>((set) => ({
  currentScreen: 'landing',
  documentName: '',
  documentText: '',
  detections: [],
  loading: false,
  error: null,
  reviewedIds: new Set(),
  viewEnteredAt: null,
  fallbackOccurred: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  
  setReviewData: ({ name, text, detections, fallbackOccurred }) => set({
    currentScreen: 'review',
    documentName: name,
    documentText: text,
    detections,
    reviewedIds: new Set(),
    viewEnteredAt: Date.now(),
    error: null,
    fallbackOccurred: !!fallbackOccurred,
  }),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  markReviewed: (id) => set((state) => {
    const newReviewed = new Set(state.reviewedIds);
    newReviewed.add(id);
    return { reviewedIds: newReviewed };
  }),

  bulkApprove: () => set((state) => {
    const allIds = new Set(state.detections.map(d => d.detectionId));
    return { reviewedIds: allIds, currentScreen: 'complete' };
  }),

  reset: () => set({
    currentScreen: 'landing',
    documentName: '',
    documentText: '',
    detections: [],
    loading: false,
    error: null,
    reviewedIds: new Set(),
    viewEnteredAt: null,
    fallbackOccurred: false,
  }),

  setViewEnteredAt: (time) => set({ viewEnteredAt: time }),
}));
