import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queueAPI } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { PriorityBadge } from '../components/PriorityBadge.jsx';
import { getSocket, joinRoom, leaveRoom } from '../services/socket.js';

export const QueueTracker = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchEntry = useCallback(async () => {
    try {
      const res = await queueAPI.getEntry(id);
      setEntry(res.data);
      setLastRefreshed(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load token details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();

    const interval = setInterval(fetchEntry, 8000);
    return () => clearInterval(interval);
  }, [fetchEntry]);

  useEffect(() => {
    if (!entry?.service?.id) return;

    const roomName = `service:${entry.service.id}`;
    joinRoom(roomName);

    const socket = getSocket();
    const handleQueueUpdate = () => {
      fetchEntry();
    };

    const handleTokenCalled = (payload) => {
      if (payload.tokenNumber === entry.tokenNumber) {
        fetchEntry();
      }
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:called', handleTokenCalled);
    socket.on('token:cancelled', handleQueueUpdate);

    return () => {
      leaveRoom(roomName);
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:called', handleTokenCalled);
      socket.off('token:cancelled', handleQueueUpdate);
    };
  }, [entry?.service?.id, entry?.tokenNumber, fetchEntry]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your place in the queue?')) return;
    setCancelling(true);
    try {
      await queueAPI.cancelEntry(id);
      await fetchEntry();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to cancel queue entry');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="text-center font-mono text-zinc-400 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest">Querying Queue Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center space-y-4">
          <div className="text-rose-400 font-mono text-sm">{error || 'Token not found'}</div>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded text-xs font-mono"
          >
            ← Return to Services
          </Link>
        </div>
      </div>
    );
  }

  const isTurnNow = entry.status === 'CALLED' || entry.status === 'IN_SERVICE';
  const isFinished = entry.status === 'COMPLETED' || entry.status === 'CANCELLED' || entry.status === 'SKIPPED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      {isTurnNow && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-950/80 border-2 border-emerald-500 text-emerald-100 flex items-center justify-between animate-pulse">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              ⚡ Action Required — Your Turn is Now!
            </div>
            <div className="text-sm font-semibold mt-0.5">
              Please proceed immediately to{' '}
              <span className="text-white underline font-bold">
                {entry.counter?.name || 'Assigned Counter'}
              </span>
            </div>
          </div>
          <span className="text-2xl font-mono font-black text-emerald-400">
            {entry.counter?.name || 'COUNTER'}
          </span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 bg-zinc-950/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {entry.service.name}
              </span>
              <PriorityBadge score={entry.priorityScore} />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 mt-1">Live Queue Position</h1>
          </div>

          <StatusBadge status={entry.status} />
        </div>

        <div className="p-8 text-center border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            Your Assigned Token Number
          </div>
          <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-amber-400 drop-shadow-sm">
            {entry.tokenNumber}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-2">
            Joined at: {new Date(entry.joinedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 bg-zinc-900/50">
          <div className="p-6 text-center">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Position in Line
            </div>
            <div className="text-3xl font-mono font-bold text-zinc-100">
              {entry.status === 'WAITING' ? `#${entry.position}` : '—'}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              {entry.status === 'WAITING'
                ? `${entry.position - 1} people ahead of you`
                : entry.status}
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Est. Waiting Time
            </div>
            <div className="text-3xl font-mono font-bold text-amber-400">
              {entry.status === 'WAITING' ? `~${entry.estimatedWaitMinutes}m` : '—'}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              Subject to counter flow
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Now Serving
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-400">
              {entry.currentlyServingToken || 'None'}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              Active Counter Token
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 rounded transition-colors"
            >
              Browse Services
            </Link>

            {!isFinished && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3 py-1.5 text-rose-400 hover:text-white hover:bg-rose-950 border border-rose-900/60 rounded transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Token'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
