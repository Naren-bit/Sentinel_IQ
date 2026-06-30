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

export interface ValidationWarning {
  detectionId: string;
  errors: string[];
}

interface AppState {
  currentScreen: 'landing' | 'upload' | 'review' | 'complete';
  documentName: string;
  documentText: string;
  detections: Detection[];
  loading: boolean;
  error: string | null;
  reviewedIds: Set<string>;
  approvedIds: Set<string>;
  dismissedIds: Set<string>;
  viewEnteredAt: number | null;
  fallbackOccurred: boolean;
  validationWarnings: ValidationWarning[];
  
  setScreen: (screen: 'landing' | 'upload' | 'review' | 'complete') => void;
  setReviewData: (data: { name: string; text: string; detections: Detection[], fallbackOccurred?: boolean, validationWarnings?: ValidationWarning[] }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markApproved: (id: string) => void;
  markDismissed: (id: string) => void;
  markReviewed: (id: string) => void;
  bulkApprove: () => void;
  reset: () => void;
  setViewEnteredAt: (time: number) => void;
  getRedactedText: () => string;
}

export const useStore = create<AppState>((set, get) => ({
  currentScreen: 'landing',
  documentName: '',
  documentText: '',
  detections: [],
  loading: false,
  error: null,
  reviewedIds: new Set(),
  approvedIds: new Set(),
  dismissedIds: new Set(),
  viewEnteredAt: null,
  fallbackOccurred: false,
  validationWarnings: [],

  setScreen: (screen) => set({ currentScreen: screen }),
  
  setReviewData: ({ name, text, detections, fallbackOccurred, validationWarnings }) => set({
    currentScreen: 'review',
    documentName: name,
    documentText: text,
    detections,
    reviewedIds: new Set(),
    approvedIds: new Set(),
    dismissedIds: new Set(),
    viewEnteredAt: Date.now(),
    error: null,
    fallbackOccurred: !!fallbackOccurred,
    validationWarnings: validationWarnings || [],
  }),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  markApproved: (id) => set((state) => {
    const newReviewed = new Set(state.reviewedIds);
    const newApproved = new Set(state.approvedIds);
    newReviewed.add(id);
    newApproved.add(id);
    return { reviewedIds: newReviewed, approvedIds: newApproved };
  }),

  markDismissed: (id) => set((state) => {
    const newReviewed = new Set(state.reviewedIds);
    const newDismissed = new Set(state.dismissedIds);
    newReviewed.add(id);
    newDismissed.add(id);
    return { reviewedIds: newReviewed, dismissedIds: newDismissed };
  }),

  // Legacy — kept for backward compat, defaults to "approved"
  markReviewed: (id) => set((state) => {
    const newReviewed = new Set(state.reviewedIds);
    const newApproved = new Set(state.approvedIds);
    newReviewed.add(id);
    newApproved.add(id);
    return { reviewedIds: newReviewed, approvedIds: newApproved };
  }),

  bulkApprove: () => set((state) => {
    const allIds = new Set(state.detections.map(d => d.detectionId));
    // Bulk approve treats everything not already dismissed as approved
    const newApproved = new Set(state.approvedIds);
    for (const id of allIds) {
      if (!state.dismissedIds.has(id)) {
        newApproved.add(id);
      }
    }
    return { reviewedIds: allIds, approvedIds: newApproved, currentScreen: 'complete' };
  }),

  reset: () => set({
    currentScreen: 'landing',
    documentName: '',
    documentText: '',
    detections: [],
    loading: false,
    error: null,
    reviewedIds: new Set(),
    approvedIds: new Set(),
    dismissedIds: new Set(),
    viewEnteredAt: null,
    fallbackOccurred: false,
    validationWarnings: [],
  }),

  setViewEnteredAt: (time) => set({ viewEnteredAt: time }),

  getRedactedText: () => {
    const state = get();
    const { documentText, detections, approvedIds } = state;
    
    // Get approved detections sorted by start position (descending)
    // so we can replace from end to start without shifting offsets
    const approvedDetections = detections
      .filter(d => approvedIds.has(d.detectionId) && d.start !== undefined && d.end !== undefined)
      .sort((a, b) => (b.start || 0) - (a.start || 0));
    
    let redacted = documentText;
    for (const det of approvedDetections) {
      if (det.start === undefined || det.end === undefined) continue;
      const redactionLabel = `[REDACTED — ${det.type}]`;
      redacted = redacted.substring(0, det.start) + redactionLabel + redacted.substring(det.end);
    }
    
    return redacted;
  },
}));
