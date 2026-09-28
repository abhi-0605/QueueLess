import React, { useState } from 'react';
import { queueAPI } from '../services/api.js';

export const JoinQueueModal = ({ service, isOpen, onClose, onSuccess }) => {
  const [priorityAttributes, setPriorityAttributes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !service) return null;

  const rules = service.priority_config?.rules || [
    { attribute: 'isElderly', boost: 100 },
    { attribute: 'isDisabled', boost: 100 },
    { attribute: 'isEmergency', boost: 200 }
  ];

  const handleToggle = (attr) => {
    setPriorityAttributes((prev) => ({
      ...prev,
      [attr]: !prev[attr]
    }));
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await queueAPI.join(service.id, { priorityAttributes });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'Unable to join queue at this time. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-lg overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Check-In Verification
            </span>
            <h3 className="text-lg font-bold text-zinc-100">{service.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 font-mono text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Waiting Ahead</div>
              <div className="text-xl font-bold font-mono text-zinc-100">
                {service.queueInfo?.queueSize ?? 0}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Est. Wait</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                ~{service.queueInfo?.estimatedWaitMinutes ?? 0} min
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Assistance & Priority Eligibility
            </label>
            <div className="space-y-2">
              {rules.map((rule) => {
                const labelMap = {
                  isElderly: 'Senior Citizen / Elderly Assistance',
                  isDisabled: 'Differently Abled / Mobility Assistance',
                  isEmergency: 'Emergency / Urgent Medical Triage',
                  vipTier: 'Priority Tier Access'
                };
                const label = labelMap[rule.attribute] || rule.attribute;

                return (
                  <label
                    key={rule.attribute}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      priorityAttributes[rule.attribute]
                        ? 'bg-amber-950/30 border-amber-700/80 text-amber-200'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!priorityAttributes[rule.attribute]}
                        onChange={() => handleToggle(rule.attribute)}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-0 bg-zinc-900"
                      />
                      <span>{label}</span>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400/90">
                      +{rule.boost} pts
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-mono font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-colors"
            >
              {loading ? 'Generating Token...' : 'Confirm & Generate Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
