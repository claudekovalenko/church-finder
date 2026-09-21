import { useCallback, useEffect, useMemo, useState } from 'react';
import { CANDIDATES } from './data/candidates';
import { TRADITIONS } from './data/traditions';
import { DEFAULT_PROFILE } from './domain/profile';
import type {
  AxisDatum,
  AxisId,
  AxisPreference,
  Church,
  Profile,
  Stage,
  VisitNote,
} from './domain/types';

const STORAGE_KEY = 'church-finder/v1';

export interface AppState {
  profile: Profile;
  churches: Church[];
}

function seed(): AppState {
  return {
    profile: DEFAULT_PROFILE,
    // Candidates first: they are the actual decision. The traditions are
    // reference material for narrowing the field.
    churches: [...CANDIDATES, ...TRADITIONS],
  };
}

function load(): AppState {
  if (typeof localStorage === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.profile?.preferences || !Array.isArray(parsed.churches)) return seed();
    return parsed;
  } catch {
    // A corrupt blob should not brick the app; falling back to the seed loses
    // saved work, which is why there is an export button.
    return seed();
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Out of quota or blocked storage. Nothing useful to do here — the app
      // still works for the session.
    }
  }, [state]);

  const updatePreference = useCallback((axisId: AxisId, patch: Partial<AxisPreference>) => {
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        updatedAt: new Date().toISOString(),
        preferences: s.profile.preferences.map((p) =>
          p.axisId === axisId ? { ...p, ...patch } : p,
        ),
      },
    }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...patch, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const updateChurch = useCallback((id: string, patch: Partial<Church>) => {
    setState((s) => ({
      ...s,
      churches: s.churches.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const setValue = useCallback((id: string, axisId: AxisId, datum: AxisDatum | null) => {
    setState((s) => ({
      ...s,
      churches: s.churches.map((c) => {
        if (c.id !== id) return c;
        const values = { ...c.values };
        if (datum === null) delete values[axisId];
        else values[axisId] = datum;
        return { ...c, values };
      }),
    }));
  }, []);

  const setStage = useCallback(
    (id: string, stage: Stage) => updateChurch(id, { stage }),
    [updateChurch],
  );

  const addVisit = useCallback((id: string, visit: Omit<VisitNote, 'id'>) => {
    setState((s) => ({
      ...s,
      churches: s.churches.map((c) =>
        c.id === id
          ? { ...c, visits: [{ ...visit, id: `visit-${Date.now()}` }, ...c.visits] }
          : c,
      ),
    }));
  }, []);

  const removeVisit = useCallback((id: string, visitId: string) => {
    setState((s) => ({
      ...s,
      churches: s.churches.map((c) =>
        c.id === id ? { ...c, visits: c.visits.filter((v) => v.id !== visitId) } : c,
      ),
    }));
  }, []);

  const addChurch = useCallback((name: string) => {
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()
      .toString(36)
      .slice(-4)}`;
    setState((s) => ({
      ...s,
      churches: [
        {
          id,
          name,
          kind: 'candidate',
          stage: 'shortlist',
          summary: '',
          notes: '',
          values: {},
          visits: [],
        },
        ...s.churches,
      ],
    }));
    return id;
  }, []);

  const removeChurch = useCallback((id: string) => {
    setState((s) => ({ ...s, churches: s.churches.filter((c) => c.id !== id) }));
  }, []);

  /**
   * Copy a tradition's values onto a church as *inferred* data at half the
   * archetype's confidence. This is a starting point to correct, not a finding —
   * hence the downgraded provenance and the note on every value.
   */
  const inheritFromTradition = useCallback((id: string, traditionId: string) => {
    setState((s) => {
      const tradition = s.churches.find((c) => c.id === traditionId);
      if (!tradition) return s;
      return {
        ...s,
        churches: s.churches.map((c) => {
          if (c.id !== id) return c;
          const values = { ...c.values };
          for (const [axisId, datum] of Object.entries(tradition.values)) {
            // Never overwrite something you actually established.
            if (values[axisId]) continue;
            values[axisId] = {
              value: datum!.value,
              confidence: Math.min(0.5, datum!.confidence * 0.5),
              provenance: 'inferred',
              note: `Assumed from ${tradition.name}. Confirm against what this church actually says.`,
            };
          }
          return { ...c, values, traditionId };
        }),
      };
    });
  }, []);

  const reset = useCallback(() => setState(seed()), []);

  const replaceState = useCallback((next: AppState) => setState(next), []);

  const byId = useMemo(
    () => new Map(state.churches.map((c) => [c.id, c])),
    [state.churches],
  );

  return {
    state,
    byId,
    actions: {
      updatePreference,
      updateProfile,
      updateChurch,
      setValue,
      setStage,
      addVisit,
      removeVisit,
      addChurch,
      removeChurch,
      inheritFromTradition,
      reset,
      replaceState,
    },
  };
}

export type Actions = ReturnType<typeof useAppState>['actions'];
