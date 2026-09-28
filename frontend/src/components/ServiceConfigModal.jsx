import React, { useState } from 'react';
import { serviceAPI } from '../services/api.js';

export const ServiceConfigModal = ({ isOpen, onClose, orgId, serviceToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: serviceToEdit?.name || '',
    description: serviceToEdit?.description || '',
    avg_service_time_seconds: serviceToEdit?.avg_service_time_seconds || 300,
    is_active: serviceToEdit?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (serviceToEdit) {
        await serviceAPI.update(serviceToEdit.id, formData);
      } else {
        await serviceAPI.create(orgId, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save service configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-lg overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Admin Configuration
            </span>
            <h3 className="text-lg font-bold text-zinc-100">
              {serviceToEdit ? 'Configure Service Parameters' : 'Create New Service Department'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 font-mono text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/80 font-mono"
              placeholder="e.g. Ophthalmology Clinic"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/80 font-sans"
              placeholder="Operational details and instructions for patients"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Average Service Duration (seconds)
            </label>
            <input
              type="number"
              min={30}
              step={10}
              required
              value={formData.avg_service_time_seconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  avg_service_time_seconds: parseInt(e.target.value, 10) || 300
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/80 font-mono"
            />
            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              Currently {Math.round(formData.avg_service_time_seconds / 60)} minutes per token. Used for wait-time calculations.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-zinc-700 text-amber-500 focus:ring-0 bg-zinc-950"
            />
            <label htmlFor="is_active" className="text-xs font-mono text-zinc-300 cursor-pointer">
              Service actively accepting queue entries
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
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
              {loading ? 'Saving...' : serviceToEdit ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
