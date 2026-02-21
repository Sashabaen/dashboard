import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Submission, BrokerProfile, DashboardStats, CarrierQuote } from '../types';
import { mockSubmissions, mockProfile, mockStats } from '../data/mockData';

interface RaterContextType {
  submissions: Submission[];
  profile: BrokerProfile;
  stats: DashboardStats;
  getSubmissionById: (id: string) => Submission | undefined;
  getActiveSubmissions: () => Submission[];
  selectQuote: (submissionId: string, quoteId: string) => void;
  bindQuote: (submissionId: string, quoteId: string) => void;
  updateProfile: (updates: Partial<BrokerProfile>) => void;
  getQuotesForLine: (submission: Submission, line: string) => CarrierQuote[];
}

const RaterContext = createContext<RaterContextType | null>(null);

export function RaterProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [profile, setProfile] = useState<BrokerProfile>(mockProfile);
  const [stats] = useState<DashboardStats>(mockStats);

  const getSubmissionById = useCallback((id: string) => {
    return submissions.find(s => s.id === id);
  }, [submissions]);

  const getActiveSubmissions = useCallback(() => {
    return submissions.filter(s => s.status !== 'bound' && s.status !== 'declined');
  }, [submissions]);

  const getQuotesForLine = useCallback((submission: Submission, line: string) => {
    return submission.quotes.filter(q => q.line === line);
  }, []);

  const selectQuote = useCallback((submissionId: string, quoteId: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === submissionId ? { ...s, selectedQuoteId: quoteId } : s
    ));
  }, []);

  const bindQuote = useCallback((submissionId: string, quoteId: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== submissionId) return s;
      return {
        ...s,
        status: 'bound' as const,
        selectedQuoteId: quoteId,
        quotes: s.quotes.map(q =>
          q.id === quoteId ? { ...q, status: 'bound' as const, bindable: false } : q
        ),
      };
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<BrokerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <RaterContext.Provider value={{
      submissions,
      profile,
      stats,
      getSubmissionById,
      getActiveSubmissions,
      selectQuote,
      bindQuote,
      updateProfile,
      getQuotesForLine,
    }}>
      {children}
    </RaterContext.Provider>
  );
}

export function useRater() {
  const context = useContext(RaterContext);
  if (!context) {
    throw new Error('useRater must be used within a RaterProvider');
  }
  return context;
}
