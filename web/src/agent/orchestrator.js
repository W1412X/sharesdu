import { AgentRuntime } from './runtime/agentRuntime';

export const createOrchestrator = () => {
  const runtime = new AgentRuntime();
  return {
    handle: (opts) => runtime.handle(opts),
  };
};
