import React, { useState, useEffect } from 'react';
import {
  Award,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Eye,
  Plus,
} from 'lucide-react';
import { Offer, Employee } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { OfferLetterModal } from '../components/OfferLetterModal';
import { EmployeeOnboardingModal } from '../components/EmployeeOnboardingModal';

export const OffersView: React.FC = () => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
  const [onboardingOffer, setOnboardingOffer] = useState<Offer | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await api.getOffers();
      setOffers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-bold';
      case 'Sent':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Expired':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Job Offer Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isCandidate
            ? 'Review job offers extended to you, check compensation & benefits, and confirm acceptance'
            : 'Track official job offers, monitor candidate acceptances, and onboard selected talent'}
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Award className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No active job offers</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Offers are generated when a candidate passes final interviews and is selected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map(off => (
            <div
              key={off.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/80">
                    {off.offerId}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${getStatusBadge(off.status)}`}>
                    {off.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{off.candidateName}</h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{off.jobTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{off.departmentName}</p>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{off.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Start: {off.joiningDate} • Expires: {off.expiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{off.benefits.length} core benefits included</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingOffer(off)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Offer Letter
                </button>

                {/* If Accepted and HR/Admin, show Onboard Employee button */}
                {isHR && off.status === 'Accepted' && (
                  <button
                    onClick={() => setOnboardingOffer(off)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Onboard Staff
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Offer Modal */}
      {viewingOffer && (
        <OfferLetterModal
          offer={viewingOffer}
          onClose={() => setViewingOffer(null)}
          onOfferUpdated={updated => {
            fetchOffers();
            setViewingOffer(null);
          }}
        />
      )}

      {/* Onboarding Modal */}
      {onboardingOffer && (
        <EmployeeOnboardingModal
          offer={onboardingOffer}
          onClose={() => setOnboardingOffer(null)}
          onOnboarded={() => {
            fetchOffers();
            setOnboardingOffer(null);
            alert('Candidate successfully onboarded into organization staff directory!');
          }}
        />
      )}
    </div>
  );
};
