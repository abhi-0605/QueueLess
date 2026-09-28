import React, { useEffect, useState, useCallback } from 'react';
import { organizationAPI, serviceAPI, counterAPI, queueAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { PriorityBadge } from '../components/PriorityBadge.jsx';
import { QueueMetricCard } from '../components/QueueMetricCard.jsx';
import { ServiceConfigModal } from '../components/ServiceConfigModal.jsx';
import { getSocket, joinRoom, leaveRoom } from '../services/socket.js';

export const AdminDashboard = () => {
  const { isAdmin } = useAuth();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState('');

  const [queueState, setQueueState] = useState(null);
  const [entries, setEntries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  const fetchOrgs = async () => {
    try {
      const res = await organizationAPI.list();
      setOrganizations(res.data);
      if (res.data.length > 0 && !selectedOrgId) {
        setSelectedOrgId(res.data[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch organizations');
    }
  };

  const fetchServices = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const res = await serviceAPI.listByOrg(orgId);
      setServices(res.data);
      if (res.data.length > 0 && !selectedServiceId) {
        setSelectedServiceId(res.data[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load services');
    }
  }, [selectedServiceId]);

  const fetchCounters = useCallback(async (serviceId) => {
    if (!serviceId) return;
    try {
      const res = await serviceAPI.getCounters(serviceId);
      setCounters(res.data);
      if (res.data.length > 0) {
        setSelectedCounterId(res.data[0].id);
      } else {
        setSelectedCounterId('');
      }
    } catch {
      setCounters([]);
    }
  }, []);

  const fetchQueueData = useCallback(async (serviceId) => {
    if (!serviceId) return;
    try {
      const [stateRes, entriesRes] = await Promise.all([
        queueAPI.getState(serviceId),
        queueAPI.listEntries(serviceId, statusFilter || null)
      ]);
      setQueueState(stateRes.data);
      setEntries(entriesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch queue entries');
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchServices(selectedOrgId);
    }
  }, [selectedOrgId, fetchServices]);

  useEffect(() => {
    if (selectedServiceId) {
      fetchCounters(selectedServiceId);
      fetchQueueData(selectedServiceId);
    }
  }, [selectedServiceId, fetchCounters, fetchQueueData]);

  useEffect(() => {
    if (!selectedServiceId) return;

    const room = `service:${selectedServiceId}`;
    joinRoom(room);

    const socket = getSocket();
    const handleUpdate = () => {
      fetchQueueData(selectedServiceId);
    };

    socket.on('queue:update', handleUpdate);
    socket.on('token:called', handleUpdate);
    socket.on('token:cancelled', handleUpdate);

    return () => {
      leaveRoom(room);
      socket.off('queue:update', handleUpdate);
      socket.off('token:called', handleUpdate);
      socket.off('token:cancelled', handleUpdate);
    };
  }, [selectedServiceId, fetchQueueData]);

  const handleCallNext = async () => {
    if (!selectedCounterId) {
      setError('Please select or create an active counter before calling next.');
      return;
    }
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await counterAPI.callNext(selectedCounterId);
      setMessage(res.data.message || 'Next token called');
      await fetchQueueData(selectedServiceId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to call next token');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEntryAction = async (action, entryId) => {
    setActionLoading(true);
    setError('');
    try {
      if (action === 'skip') await queueAPI.skipEntry(entryId);
      if (action === 'recall') await queueAPI.recallEntry(entryId);
      if (action === 'complete') await queueAPI.completeEntry(entryId);
      if (action === 'cancel') await queueAPI.cancelEntry(entryId);
      await fetchQueueData(selectedServiceId);
    } catch (err) {
      setError(err.response?.data?.error?.message || `Failed to perform action`);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedCounter = counters.find((c) => c.id === selectedCounterId);

  const activeServing = entries.find(
    (e) => (e.status === 'CALLED' || e.status === 'IN_SERVICE') && e.counter_id === selectedCounterId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                Live Operations Command Console
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
              Counter Service Manager
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Department / Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-100 rounded px-3 py-1.5 focus:outline-none focus:border-amber-400"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.queueInfo?.queueSize ?? 0} waiting)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Active Counter
              </label>
              <select
                value={selectedCounterId}
                onChange={(e) => setSelectedCounterId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-100 rounded px-3 py-1.5 focus:outline-none focus:border-amber-400"
              >
                {counters.length === 0 && <option value="">No counters configured</option>}
                {counters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div className="pt-4 lg:pt-0">
                <button
                  onClick={() => {
                    setServiceToEdit(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-200 rounded transition-colors"
                >
                  + Add Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-zinc-200">✕</button>
        </div>
      )}

      {message && (
        <div className="p-3.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-zinc-400 hover:text-zinc-200">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-zinc-400">
                Counter Dispatch
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-amber-400">
                {selectedCounter?.name || 'No Counter'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 mb-4 text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                Currently At Counter
              </div>
              <div className="text-4xl font-mono font-black text-amber-400">
                {activeServing ? activeServing.token_number : 'IDLE'}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1">
                {activeServing
                  ? `Customer: ${activeServing.user.name}`
                  : 'Awaiting next queue dispatch'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCallNext}
              disabled={actionLoading || !selectedCounterId}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-mono font-black text-sm tracking-wider uppercase rounded shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>CALL NEXT TOKEN</span>
              <span className="text-xs opacity-75">↵</span>
            </button>

            {activeServing && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleEntryAction('complete', activeServing.id)}
                  disabled={actionLoading}
                  className="py-2 text-xs font-mono font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded transition-colors"
                >
                  ✓ Complete
                </button>
                <button
                  onClick={() => handleEntryAction('skip', activeServing.id)}
                  disabled={actionLoading}
                  className="py-2 text-xs font-mono font-semibold bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-800 rounded transition-colors"
                >
                  Skip Token
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <QueueMetricCard
            label="Waiting Tokens"
            value={queueState?.queueSize ?? 0}
            subtext="Tokens in waiting queue"
            accent="amber"
          />
          <QueueMetricCard
            label="Service Leader"
            value={queueState?.currentlyServing?.tokenNumber || 'None'}
            subtext={queueState?.currentlyServing ? `At ${queueState.currentlyServing.counterName}` : 'Idle'}
            accent="emerald"
          />
          <QueueMetricCard
            label="Estimated Line Wait"
            value={`~${queueState?.estimatedWaitMinutes ?? 0}m`}
            subtext="Rolling estimate"
            accent="neutral"
          />
          <QueueMetricCard
            label="Dept Target Rate"
            value={`${Math.round((selectedService?.avg_service_time_seconds || 300) / 60)} min`}
            subtext="Target service duration"
            accent="neutral"
          />
          <QueueMetricCard
            label="Total Entries Today"
            value={entries.length}
            subtext="All statuses logged"
            accent="neutral"
          />
          <QueueMetricCard
            label="Counters Online"
            value={`${counters.filter((c) => c.status === 'OPEN').length} / ${counters.length}`}
            subtext="Operational desks"
            accent="blue"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-200">
              Queue Roster
            </h2>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              {entries.length} records
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {[
              { label: 'All', value: '' },
              { label: 'Waiting', value: 'WAITING' },
              { label: 'Called', value: 'CALLED' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Skipped', value: 'SKIPPED' }
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setStatusFilter(f.value)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === f.value
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient / User</th>
                <th className="py-3 px-4">Priority Rule</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Counter</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-xs font-mono">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No entries found matching filter.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const minutesWaiting = Math.round(
                    (Date.now() - new Date(entry.joined_at).getTime()) / 60000
                  );

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        entry.status === 'CALLED' ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-amber-400 text-sm">
                        {entry.token_number}
                      </td>
                      <td className="py-3 px-4 text-zinc-200">
                        <div>{entry.user.name}</div>
                        <div className="text-[10px] text-zinc-400">{entry.user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge score={entry.priority_score} />
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {minutesWaiting}m ago
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {entry.counter?.name || '—'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {entry.status === 'WAITING' && (
                          <button
                            onClick={() => handleEntryAction('cancel', entry.id)}
                            className="px-2 py-1 bg-zinc-950 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-800 rounded transition-colors text-[11px]"
                          >
                            Cancel
                          </button>
                        )}
                        {entry.status === 'CALLED' && (
                          <>
                            <button
                              onClick={() => handleEntryAction('complete', entry.id)}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded transition-colors text-[11px]"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => handleEntryAction('skip', entry.id)}
                              className="px-2 py-1 bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-800 rounded transition-colors text-[11px]"
                            >
                              Skip
                            </button>
                          </>
                        )}
                        {entry.status === 'SKIPPED' && (
                          <button
                            onClick={() => handleEntryAction('recall', entry.id)}
                            className="px-2 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded transition-colors text-[11px]"
                          >
                            Recall
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceConfigModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        orgId={selectedOrgId}
        serviceToEdit={serviceToEdit}
        onSuccess={() => fetchServices(selectedOrgId)}
      />
    </div>
  );
};
