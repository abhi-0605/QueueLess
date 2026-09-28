import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationAPI, serviceAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { JoinQueueModal } from '../components/JoinQueueModal.jsx';
import { getSocket } from '../services/socket.js';

export const UserDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeModalService, setActiveModalService] = useState(null);

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
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchServices(selectedOrgId);
    }
  }, [selectedOrgId, fetchServices]);

  useEffect(() => {
    const socket = getSocket();
    const handleQueueUpdate = (data) => {
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === data.serviceId) {
            return {
              ...s,
              queueInfo: {
                ...s.queueInfo,
                queueSize: data.queueSize,
                currentlyServingToken: data.currentlyServing,
                estimatedWaitMinutes: data.estimatedWait
              }
            };
          }
          return s;
        })
      );
    };

    socket.on('queue:update', handleQueueUpdate);
    return () => {
      socket.off('queue:update', handleQueueUpdate);
    };
  }, []);

  const handleJoinClick = (service) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActiveModalService(service);
  };

  const handleJoinSuccess = (result) => {
    if (result?.queueEntryId) {
      navigate(`/tracker/${result.queueEntryId}`);
    } else {
      fetchServices(selectedOrgId);
    }
  };

  const currentOrg = organizations.find((o) => o.id === selectedOrgId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Department Queue Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            {currentOrg?.name || 'Available Services'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Select a service department to join the live queue, obtain an automated token, and receive real-time call notifications.
          </p>
        </div>

        {organizations.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Facility:</span>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-mono text-zinc-400 text-xs uppercase tracking-widest">
          Loading Service Departments...
        </div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
          <p className="text-zinc-400 font-mono text-sm">No active services registered for this facility.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const queueSize = service.queueInfo?.queueSize ?? 0;
            const estWait = service.queueInfo?.estimatedWaitMinutes ?? 0;
            const nowServing = service.queueInfo?.currentlyServingToken;

            return (
              <div
                key={service.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 flex flex-col justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                      Dept #{service.id.slice(0, 4)}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {service.description || 'General outpatient department queue.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 border border-zinc-800/80 rounded-md mb-4 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase">Waiting</div>
                      <div className="text-lg font-bold text-zinc-100">{queueSize}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase">Serving</div>
                      <div className="text-lg font-bold text-emerald-400">
                        {nowServing || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase">Est Wait</div>
                      <div className="text-lg font-bold text-amber-400">
                        ~{estWait}m
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {Math.round(service.avg_service_time_seconds / 60)} min / token
                  </span>
                  <button
                    onClick={() => handleJoinClick(service)}
                    className="px-4 py-2 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded transition-colors"
                  >
                    Join Queue →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <JoinQueueModal
        service={activeModalService}
        isOpen={!!activeModalService}
        onClose={() => setActiveModalService(null)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};
