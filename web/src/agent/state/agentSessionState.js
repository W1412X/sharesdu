const DEFAULT_STATE = {
  version: 2,
  last_route: null,
  last_plan: null,
  last_error: null,
  memory: {
    confirmed_entities: [],
    filters: {},
    notes: [],
    summary: '',
    last_user_text: '',
    last_answer: '',
  },
};

const mergeMemory = (base, patch) => ({
  ...base,
  ...(patch && typeof patch === 'object' ? patch : {}),
});

export class AgentSessionState {
  constructor(raw = {}) {
    const input = raw && typeof raw === 'object' ? raw : {};
    this.state = {
      ...DEFAULT_STATE,
      ...input,
      version: DEFAULT_STATE.version,
      memory: mergeMemory(DEFAULT_STATE.memory, input.memory),
    };
  }

  static from(raw) {
    return new AgentSessionState(raw);
  }

  recordRoute(route) {
    this.state.last_route = {
      ...(route && typeof route === 'object' ? route : {}),
      updated_at: Date.now(),
    };
    return this;
  }

  recordPlan(plan) {
    this.state.last_plan = {
      ...(plan && typeof plan === 'object' ? plan : {}),
      updated_at: Date.now(),
    };
    return this;
  }

  recordError(error) {
    const message = typeof error === 'string' ? error : (error?.message || 'unknown_error');
    this.state.last_error = {
      message,
      at: Date.now(),
    };
    return this;
  }

  mergeMemory(patch) {
    this.state.memory = mergeMemory(this.state.memory, patch);
    return this;
  }

  setMemorySummary(summary) {
    this.state.memory.summary = String(summary || '').trim();
    return this;
  }

  bumpNotes(note, limit = 20) {
    const text = String(note || '').trim();
    if (!text) return this;
    const notes = Array.isArray(this.state.memory.notes) ? [...this.state.memory.notes] : [];
    notes.unshift({ text, at: Date.now() });
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) ? Math.max(0, Math.floor(parsedLimit)) : 20;
    this.state.memory.notes = notes.slice(0, safeLimit);
    return this;
  }

  toJSON() {
    return {
      ...this.state,
      memory: {
        ...DEFAULT_STATE.memory,
        ...(this.state.memory || {}),
      },
    };
  }
}

export const createDefaultAgentSessionState = () => new AgentSessionState();
