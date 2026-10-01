import React, { useState } from 'react';
import { Award, Check, X, Printer, Calendar, DollarSign, ShieldCheck, Building } from 'lucide-react';
import { Offer, Application } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface OfferLetterModalProps {
  offer?: Offer;
  application?: Application;
  onClose: () => void;
  onOfferUpdated: (updatedOffer: Offer) => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  offer,
  application,
  onClose,
  onOfferUpdated,
}) => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  // Form State for creating new offer
  const [salary, setSalary] = useState(offer?.salary || '₹135,000 / year');
  const [joiningDate, setJoiningDate] = useState(offer?.joiningDate || '2026-11-15');
  const [expiryDate, setExpiryDate] = useState(offer?.expiryDate || '2026-11-01');
  const [offerText, setOfferText] = useState(
    offer?.offerLetterText ||
      `Dear ${application?.candidateName || 'Candidate'},\n\nOn behalf of TalentPulse, we are thrilled to offer you the position of ${application?.jobTitle || 'Team Member'} in our ${application?.departmentName || 'Core'} department.\n\nWe were immensely impressed by your interview evaluations and credentials. We look forward to welcoming you to our team.`
  );
  const [submitting, setSubmitting] = useState(false);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setSubmitting(true);
    try {
      const newOffer = await api.createOffer({
        applicationId: application.id,
        salary,
        joiningDate,
        expiryDate,
        offerLetterText: offerText,
      });
      onOfferUpdated(newOffer);
      onClose();
    } catch (err: any) {
      alert('Error creating offer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!offer) return;
    setSubmitting(true);
    try {
      const updated = await api.updateOfferStatus(offer.id, newStatus);
      onOfferUpdated(updated);
      onClose();
    } catch (err: any) {
      alert('Error updating offer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentOffer = offer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {currentOffer ? `Job Offer Letter - ${currentOffer.offerId}` : 'Generate Official Job Offer'}
              </h2>
              <p className="text-xs text-slate-300">
                {currentOffer
                  ? `${currentOffer.candidateName} • ${currentOffer.jobTitle}`
                  : `Preparing offer for ${application?.candidateName} (${application?.jobTitle})`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Offer Preview Mode */}
        {currentOffer ? (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Status Banner */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    currentOffer.status === 'Accepted'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                      : currentOffer.status === 'Sent'
                      ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
                      : currentOffer.status === 'Rejected'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  Status: {currentOffer.status}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Valid until: {new Date(currentOffer.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Letter
              </button>
            </div>

            {/* Formal Offer Letter Document Paper */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xs space-y-6 text-slate-800 dark:text-slate-200 font-sans">
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TalentPulse Inc.</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">100 Pine Street, Suite 2400 • San Francisco, CA 94111</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentOffer.offerId}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(currentOffer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">{currentOffer.candidateName}</p>
                <p className="text-slate-600 dark:text-slate-400">{currentOffer.candidateEmail}</p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {currentOffer.offerLetterText}
              </div>

              {/* Key Terms Box */}
              <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[11px]">Key Terms of Employment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Position / Role</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentOffer.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Compensation</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentOffer.salary}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Target Start Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentOffer.joiningDate}</span>
                  </div>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Comprehensive Benefits Package Included:</h4>
                <ul className="grid grid-cols-1 gap-1.5 text-slate-600 dark:text-slate-300">
                  {currentOffer.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 flex items-end pb-1 font-serif italic text-slate-700 dark:text-slate-300 text-sm">
                    Jonathan Miller
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Authorized Representative, TalentPulse</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 flex items-end pb-1 font-serif italic text-slate-700 dark:text-slate-300 text-sm">
                    {currentOffer.status === 'Accepted' ? currentOffer.candidateName : 'Pending Acceptance'}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Candidate Acceptance Signature</p>
                </div>
              </div>
            </div>

            {/* Candidate Acceptance Controls */}
            {isCandidate && currentOffer.status === 'Sent' && (
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/60 dark:to-emerald-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Accept or Decline this Offer</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Accepting triggers employee onboarding with organizational credentials.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange('Accepted')}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    <Check className="h-4 w-4" />
                    Accept Job Offer
                  </button>
                  <button
                    onClick={() => handleStatusChange('Rejected')}
                    disabled={submitting}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Create Offer Form Mode */
          <form onSubmit={handleCreateOffer} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Salary / Compensation
                </label>
                <input
                  type="text"
                  required
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="₹140,000 / year"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Target Joining Date
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={e => setJoiningDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Offer Expiration Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Formal Offer Letter Body
              </label>
              <textarea
                rows={6}
                required
                value={offerText}
                onChange={e => setOfferText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Generating...' : 'Generate & Dispatch Offer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
