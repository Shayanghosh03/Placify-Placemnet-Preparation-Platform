import { useCallback, useEffect, useReducer, useRef } from 'react';
import { api } from '../api.js';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  loading: true,
  error: null,
  summary: null,    // full progress summary from backend
  content: {}       // cached content by "type-category" key
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUMMARY_LOADED':
      return { ...state, loading: false, summary: action.payload };
    case 'SUMMARY_UPDATED':
      return { ...state, summary: action.payload, content: {} };
    case 'CONTENT_LOADED':
      return { ...state, content: { ...state.content, [action.key]: action.payload } };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useDashboard — master hook for all dashboard data.
 *
 * Returns:
 *   state.loading, state.error, state.summary, state.content
 *   actions: { refreshSummary, loadContent, solveTopic, recordQuiz, toggleGoal, toggleBookmark }
 */
export function useDashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Load summary ───────────────────────────────────────────────────────────
  const refreshSummary = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await api.progress.getSummary();
      if (isMounted.current) dispatch({ type: 'SUMMARY_LOADED', payload: data });
    } catch (err) {
      if (isMounted.current) dispatch({ type: 'ERROR', payload: err.message });
    }
  }, []);

  // Initial load
  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  // ── Load content (topics / notes / mocks) ──────────────────────────────────
  const loadContent = useCallback(async (params = {}) => {
    const key = JSON.stringify(params);
    if (state.content[key]) return state.content[key]; // cached
    try {
      const data = await api.progress.getContent(params);
      if (isMounted.current) dispatch({ type: 'CONTENT_LOADED', key, payload: data });
      return data;
    } catch {
      return [];
    }
  }, [state.content]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const solveTopic = useCallback(async (topicId, count = 1) => {
    try {
      const res = await api.progress.solveTopic(topicId, count);
      if (isMounted.current && res?.summary) {
        dispatch({ type: 'SUMMARY_UPDATED', payload: res.summary });
      }
      return res;
    } catch (err) {
      console.error('solveTopic failed:', err.message);
      throw err;
    }
  }, []);

  const recordQuiz = useCallback(async (data) => {
    try {
      const summary = await api.progress.recordQuiz(data);
      if (isMounted.current) dispatch({ type: 'SUMMARY_UPDATED', payload: summary });
    } catch (err) {
      console.error('recordQuiz failed:', err.message);
    }
  }, []);

  const toggleGoal = useCallback(async (index, completed) => {
    try {
      const { summary } = await api.progress.toggleGoal(index, completed);
      if (isMounted.current) dispatch({ type: 'SUMMARY_UPDATED', payload: summary });
    } catch (err) {
      console.error('toggleGoal failed:', err.message);
    }
  }, []);

  const toggleBookmark = useCallback(async (data) => {
    try {
      const result = await api.progress.toggleBookmark(data);
      // Refresh summary to get updated bookmarks array
      const summary = await api.progress.getSummary();
      if (isMounted.current) dispatch({ type: 'SUMMARY_UPDATED', payload: summary });
      return result;
    } catch (err) {
      console.error('toggleBookmark failed:', err.message);
    }
  }, []);

  return {
    ...state,
    actions: { refreshSummary, loadContent, solveTopic, recordQuiz, toggleGoal, toggleBookmark }
  };
}
