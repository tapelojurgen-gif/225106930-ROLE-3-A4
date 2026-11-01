import { useCallback, useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, Edit, Save, Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import { HAS_BACKEND, getActivities, listPlans, createPlan, updatePlan, syncPending } from './api/plansApi';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activities, setActivities] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState({});            // one note per activity (was one shared note)
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');    // polite live region
  const [errorMsg, setErrorMsg] = useState('');      // assertive alert region
  const statusTimer = useRef(null);
  const editInputRef = useRef(null);

  const announce = useCallback((msg) => {
    setStatusMsg(msg);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatusMsg(''), 5000);
  }, []);

  // Load data on start, and again whenever the user presses "Try again" (reloadKey changes)
  const [reloadKey, setReloadKey] = useState(0);
  const retryLoad = () => { setLoading(true); setReloadKey((k) => k + 1); };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [acts, { plans, recovered }] = await Promise.all([getActivities(), listPlans()]);
        if (cancelled) return;
        setActivities(acts);
        setSavedPlans(plans);
        setLoadError('');
        if (recovered) announce('Some saved data on this device was damaged and has been reset. A backup copy was kept.');
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Something went wrong while loading.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey, announce]);

  // Online/offline listeners (+ sync pending plans when the connection returns)
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (!HAS_BACKEND) return;
      try {
        setSavedPlans(await syncPending());
        announce('Back online. Your plans were synced.');
      } catch {
        setErrorMsg('You are back online, but syncing failed. Your plans are still saved on this device.');
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(statusTimer.current);
    };
  }, [announce]);

  // Move keyboard focus into the edit field when editing starts
  useEffect(() => {
    if (editingPlanId) editInputRef.current?.focus();
  }, [editingPlanId]);

  const returnFocusToEditButton = (id) =>
    requestAnimationFrame(() => document.getElementById(`edit-btn-${id}`)?.focus());

  const handleSaveNewPlan = async (activity) => {
    setBusy(true);
    setErrorMsg('');
    try {
      const plan = await createPlan({ activity: activity.title, notes: notes[activity.id] || '' }, { online: isOnline });
      setSavedPlans((prev) => [...prev, plan]);
      setNotes((prev) => ({ ...prev, [activity.id]: '' }));
      announce(`Plan for ${activity.title} saved. ${plan.status}.`);
    } catch (e) {
      setErrorMsg(`Your plan was not saved. ${e.message} Please try again.`);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (plan) => {
    setEditingPlanId(plan.id);
    setEditDraft(plan.notes || '');
  };

  const cancelEdit = () => {
    const id = editingPlanId;
    setEditingPlanId(null);
    returnFocusToEditButton(id);
  };

  const handleSaveEdit = async (plan) => {
    setBusy(true);
    setErrorMsg('');
    try {
      const updated = await updatePlan(plan.id, editDraft, { online: isOnline });
      setSavedPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
      setEditingPlanId(null);
      announce(`Changes to ${plan.title} saved.`);
      returnFocusToEditButton(plan.id);
    } catch (e) {
      setErrorMsg(`Your changes were not saved. ${e.message} Your edit is still open so you can try again.`);
    } finally {
      setBusy(false);
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredActivities = activities.filter(
    (a) => a.title.toLowerCase().includes(term) || a.subject.toLowerCase().includes(term),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded focus:ring-2 focus:ring-blue-700">
        Skip to main content
      </a>

      <header className="mb-8 border-b pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">STEMMate Namibia</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
            {isOnline ? <Wifi size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
            {isOnline ? 'Online' : 'Offline mode'}
          </div>
        </div>

        {/* Polite live region: confirmations. Always in the DOM so screen readers pick up changes. */}
        <div role="status" aria-live="polite" className="mt-2 text-sm text-blue-800 min-h-5 font-medium">
          {statusMsg}
        </div>

        {/* Errors with a way to dismiss */}
        {errorMsg && (
          <div role="alert" className="mt-2 bg-red-50 border-l-4 border-red-700 text-red-900 p-3 flex items-start gap-2">
            <AlertCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p className="flex-1">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} aria-label="Dismiss error message" className="p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        {!isOnline && (
          <div role="alert" className="mt-2 bg-yellow-100 border-l-4 border-yellow-600 text-yellow-900 p-3 flex items-center gap-2">
            <AlertCircle size={20} aria-hidden="true" />
            <p>
              {HAS_BACKEND
                ? 'You are offline. Your work is saved on this device and will sync when you reconnect.'
                : 'You are offline. Your work is saved on this device.'}
            </p>
          </div>
        )}
      </header>

      <main id="main" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <p role="status" className="md:col-span-2 text-gray-700">Loading activities and plans…</p>
        ) : loadError ? (
          <div role="alert" className="md:col-span-2 bg-red-50 border border-red-300 text-red-900 p-4 rounded">
            <p className="mb-2">Could not load the app data. {loadError}</p>
            <button onClick={retryLoad} className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700">
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        ) : (
          <>
            {/* COLUMN 1: CATALOGUE */}
            <section aria-labelledby="catalogue-heading">
              <h2 id="catalogue-heading" className="text-xl font-semibold mb-4">Browse Activities</h2>

              <div className="mb-4 relative">
                <label htmlFor="search" className="sr-only">Search activities</label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search by title or subject..."
                  className="w-full p-3 pl-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-600" size={20} aria-hidden="true" />
              </div>
              <p className="sr-only" role="status">{filteredActivities.length} activities shown</p>

              {filteredActivities.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border text-center text-gray-700">
                  <p>No activities match your search.</p>
                  <button onClick={() => setSearchTerm('')} className="mt-2 text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">Clear search</button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <li key={activity.id} className="bg-white p-4 rounded-lg border shadow-sm">
                      <h3 className="font-bold text-lg">{activity.title}</h3>
                      <p className="text-sm text-gray-700 mb-2">{activity.subject} | {activity.duration}</p>

                      <form onSubmit={(e) => { e.preventDefault(); handleSaveNewPlan(activity); }}>
                        <div className="mb-4">
                          <label htmlFor={`note-${activity.id}`} className="block text-sm font-medium mb-1">Add a note to the plan (optional)</label>
                          <input
                            id={`note-${activity.id}`}
                            type="text"
                            className="w-full p-2 border border-gray-500 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            placeholder="e.g., Need extra sand"
                            value={notes[activity.id] || ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [activity.id]: e.target.value }))}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={busy}
                          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                        >
                          <Save size={16} aria-hidden="true" /> {HAS_BACKEND ? 'Save plan' : 'Save plan on this device'}
                          <span className="sr-only"> for {activity.title}</span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* COLUMN 2: SAVED PLANS & EDITING */}
            <section aria-labelledby="plans-heading">
              <h2 id="plans-heading" className="text-xl font-semibold mb-4">Your Saved Plans</h2>
              {savedPlans.length === 0 ? (
                <p className="text-gray-700 bg-white p-4 rounded border">No plans saved yet.</p>
              ) : (
                <ul className="space-y-4">
                  {savedPlans.map((plan) => (
                    <li key={plan.id} className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{plan.title}</h3>
                          <p className="text-xs text-gray-700">Status: {plan.status}</p>
                        </div>
                        <button
                          id={`edit-btn-${plan.id}`}
                          onClick={() => startEdit(plan)}
                          className="p-2.5 text-blue-700 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                          aria-label={`Edit note for ${plan.title}`}
                        >
                          <Edit size={18} aria-hidden="true" />
                        </button>
                      </div>

                      {editingPlanId === plan.id ? (
                        <form
                          className="mt-2"
                          onSubmit={(e) => { e.preventDefault(); handleSaveEdit(plan); }}
                          onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                        >
                          <label htmlFor={`edit-${plan.id}`} className="block text-sm font-medium mb-1">Edit notes for {plan.title}</label>
                          <input
                            id={`edit-${plan.id}`}
                            ref={editInputRef}
                            type="text"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            className="w-full p-2 border border-gray-500 rounded text-sm mb-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button type="submit" disabled={busy} className="bg-green-800 hover:bg-green-900 disabled:opacity-60 text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800">Save changes</button>
                            <button type="button" onClick={cancelEdit} className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <p className="mt-2 text-sm text-gray-800 bg-gray-50 p-2 rounded">
                          <strong>Note:</strong> {plan.notes || 'No notes added.'}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
