import { isStateAgendaId, type StateAgendaId } from "@/src/content/stateAgendas";

export const STATE_AGENDA_STORAGE_KEY = "missao-eluta:state-agenda:v1";
export const STATE_AGENDA_UPDATED_EVENT = "missao-eluta:state-agenda-updated";

interface StoredStateAgenda {
  version: 1;
  selectedAgendaId: StateAgendaId | null;
  updatedAt: string;
}

export function readStateAgenda(storage: Pick<Storage, "getItem">): StateAgendaId | null {
  try {
    const rawValue = storage.getItem(STATE_AGENDA_STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue) as Partial<StoredStateAgenda>;
    return isStateAgendaId(parsed.selectedAgendaId) ? parsed.selectedAgendaId : null;
  } catch {
    return null;
  }
}

export function writeStateAgenda(
  storage: Pick<Storage, "setItem">,
  selectedAgendaId: StateAgendaId,
) {
  const value: StoredStateAgenda = {
    version: 1,
    selectedAgendaId,
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(STATE_AGENDA_STORAGE_KEY, JSON.stringify(value));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STATE_AGENDA_UPDATED_EVENT));
  }
}
