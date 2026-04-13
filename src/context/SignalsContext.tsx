import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BuyingSignal } from '../types';
import { mockSignals } from '../data/mockData';

interface SignalsState {
  signals: BuyingSignal[];
}

type SignalsAction =
  | { type: 'ADD_SIGNAL'; payload: BuyingSignal }
  | { type: 'UPDATE_SIGNAL'; payload: BuyingSignal }
  | { type: 'DELETE_SIGNAL'; payload: string }
  | { type: 'LOAD_SIGNALS'; payload: BuyingSignal[] };

function signalsReducer(state: SignalsState, action: SignalsAction): SignalsState {
  switch (action.type) {
    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals] };
    case 'UPDATE_SIGNAL':
      return {
        ...state,
        signals: state.signals.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'DELETE_SIGNAL':
      return { ...state, signals: state.signals.filter((s) => s.id !== action.payload) };
    case 'LOAD_SIGNALS':
      return { ...state, signals: action.payload };
    default:
      return state;
  }
}

interface SignalsContextType {
  signals: BuyingSignal[];
  addSignal: (signal: BuyingSignal) => void;
  updateSignal: (signal: BuyingSignal) => void;
  deleteSignal: (id: string) => void;
}

const SignalsContext = createContext<SignalsContextType | null>(null);

const STORAGE_KEY = 'casexellence_signals_v1';

export function SignalsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(signalsReducer, { signals: [] });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BuyingSignal[];
        dispatch({ type: 'LOAD_SIGNALS', payload: parsed });
      } catch (_err) {
        dispatch({ type: 'LOAD_SIGNALS', payload: mockSignals });
      }
    } else {
      dispatch({ type: 'LOAD_SIGNALS', payload: mockSignals });
    }
  }, []);

  useEffect(() => {
    if (state.signals.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.signals));
    }
  }, [state.signals]);

  const addSignal = (signal: BuyingSignal) =>
    dispatch({ type: 'ADD_SIGNAL', payload: signal });
  const updateSignal = (signal: BuyingSignal) =>
    dispatch({ type: 'UPDATE_SIGNAL', payload: signal });
  const deleteSignal = (id: string) =>
    dispatch({ type: 'DELETE_SIGNAL', payload: id });

  return (
    <SignalsContext.Provider value={{ signals: state.signals, addSignal, updateSignal, deleteSignal }}>
      {children}
    </SignalsContext.Provider>
  );
}

export function useSignals() {
  const ctx = useContext(SignalsContext);
  if (!ctx) throw new Error('useSignals must be used within SignalsProvider');
  return ctx;
}
