import React, { useState } from 'react';
import { Star, CheckCircle, X, Award, MessageSquare, AlertCircle } from 'lucide-react';
import { Interview, InterviewFeedback } from '../types';
import { api } from '../api';

interface InterviewScorecardModalProps {
  interview: Interview;
  onClose: () => void;
  onSubmitted: (feedback: InterviewFeedback) => void;
}

export const InterviewScorecardModal: React.FC<InterviewScorecardModalProps> = ({
  interview,
  onClose,
  onSubmitted,
}) => {
  const existing = interview.feedback;

  const [techRating, setTechRating] = useState<number>(existing?.technicalSkillsRating || 4);
  const [commRating, setCommRating] = useState<number>(existing?.communicationRating || 4);
  const [probRating, setProbRating] = useState<number>(existing?.problemSolvingRating || 4);
  const [teamRating, setTeamRating] = useState<number>(existing?.teamworkRating || 4);
  const [expRating, setExpRating] = useState<number>(existing?.experienceRating || 4);
  const [overallRating, setOverallRating] = useState<number>(existing?.overallRating || 4);
  const [recommendation, setRecommendation] = useState<'Strong Hire' | 'Hire' | 'Neutral' | 'Do Not Hire'>(
    existing?.recommendation || 'Hire'
  );
  const [comments, setComments] = useState<string>(existing?.comments || '');
  const [submitting, setSubmitting] = useState(false);

  const criteria = [
    { label: 'Technical Skills & Depth', value: techRating, setter: setTechRating, desc: 'Mastery of core technologies, system design, and coding' },
    { label: 'Communication & Articulation', value: commRating, setter: setCommRating, desc: 'Clarity, listening skills, structured explanations' },
    { label: 'Problem Solving & Logic', value: probRating, setter: setProbRating, desc: 'Analytical thinking, handling edge cases, algorithmic speed' },
    { label: 'Teamwork & Cultural Alignment', value: teamRating, setter: setTeamRating, desc: 'Collaboration, ego, receptiveness to critique' },
    { label: 'Relevant Domain Experience', value: expRating, setter: setExpRating, desc: 'Past projects, scale, production incident handling' },
    { label: 'Overall Interview Assessment', value: overallRating, setter: setOverallRating, desc: 'Composite interviewer score' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.submitFeedback(interview.id, {
        technicalSkillsRating: techRating,
        communicationRating: commRating,
        problemSolvingRating: probRating,
        teamworkRating: teamRating,
        experienceRating: expRating,
        overallRating,
        recommendation,
        comments,
      });
      onSubmitted(result);
      onClose();
    } catch (err: any) {
      alert('Error submitting scorecard: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`h-5 w-5 ${
              star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">{value} / 5</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Interviewer Structured Scorecard & Feedback
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Candidate: <span className="font-semibold text-white">{interview.candidateName}</span> | Role: {interview.jobTitle} ({interview.type} Round)
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Evaluation Criteria Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluation Criteria (1 = Weak, 5 = Exceptional)
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2">
              {criteria.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{c.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.desc}</p>
                  </div>
                  <StarSelector value={c.value} onChange={c.setter} />
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Recommendation */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Final Hiring Recommendation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Strong Hire', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200' },
                { id: 'Hire', color: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200' },
                { id: 'Neutral', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200' },
                { id: 'Do Not Hire', color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setRecommendation(opt.id as any)}
                  className={`rounded-lg border p-2.5 text-xs font-bold transition-all text-center ${
                    recommendation === opt.id
                      ? `${opt.color} shadow-xs ring-1 ring-current`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.id}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Comments */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Interviewer Notes & Rationale
            </label>
            <textarea
              rows={4}
              required
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Highlight candidate answers to live coding questions, architecture design reasoning, communication style, and specific reasons for your hiring recommendation..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
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
              {submitting ? 'Submitting...' : 'Submit Evaluation Scorecard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
