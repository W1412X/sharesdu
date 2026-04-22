export const runToolLoop = async ({
  client,
  model,
  temperature,
  max_tokens,
  messages,
  tools,
  handlers,
  maxRounds = 16,
  signal,
  onToolStart,
  onToolResult,
  onEvent,
}) => {
  const history = [...messages];
  const toolLogs = [];
  const safeJsonStringify = (v) => {
    try {
      return JSON.stringify(v);
    } catch {
      try {
        return JSON.stringify({ ok: false, error: 'non_serializable_result' });
      } catch {
        return String(v);
      }
    }
  };
  const toolSummary = (name, result) => {
    try {
      if (!result || typeof result !== 'object') return null;
      if (result.ok !== true) return { ok: false };
      const data = result.data;
      if (!data || typeof data !== 'object') return { ok: true };

      const summary = { ok: true };
      if (typeof data.status === 'number') summary.status = data.status;
      if (typeof data.count === 'number') summary.count = data.count;
      if (Array.isArray(data.results)) summary.results_len = data.results.length;
      if (data.data && typeof data.data === 'object') {
        if (Array.isArray(data.data.items)) summary.items_len = data.data.items.length;
      }
      if (data.meta && typeof data.meta === 'object') {
        if (typeof data.meta.total === 'number') summary.total = data.meta.total;
        if (typeof data.meta.returned === 'number') summary.returned = data.meta.returned;
        if (typeof data.meta.truncated === 'boolean') summary.truncated = data.meta.truncated;
      }
      if (data._agent_meta && typeof data._agent_meta === 'object') {
        summary.used_query = data._agent_meta.used_query;
        if (Array.isArray(data._agent_meta.tried)) summary.tried = data._agent_meta.tried.length;
        if (typeof data._agent_meta.items_len === 'number') summary.items_len = data._agent_meta.items_len;
      }
      // only expose small summary fields
      summary.name = name;
      return summary;
    } catch {
      return null;
    }
  };

  for (let round = 0; round < maxRounds; round += 1) {
    onEvent && onEvent({ type: 'llm_round_start', round: round + 1, at: Date.now() });
    onEvent && onEvent({ type: 'llm_request_start', round: round + 1, at: Date.now() });
    const reqStart = Date.now();
    const resp = await client.createChatCompletion({
      model,
      messages: history,
      tools,
      tool_choice: tools?.length ? 'auto' : undefined,
      temperature,
      max_tokens,
      signal,
    });
    onEvent && onEvent({ type: 'llm_request_end', round: round + 1, ms: Date.now() - reqStart, at: Date.now() });

    const msg = resp?.choices?.[0]?.message;
    if (!msg || typeof msg !== 'object') {
      const fallback = {
        role: 'assistant',
        content: '模型返回异常：缺少 message。请稍后重试或更换模型/服务地址。',
      };
      onEvent && onEvent({ type: 'llm_invalid', round: round + 1, at: Date.now() });
      history.push(fallback);
      return { final: fallback, messages: history, toolLogs };
    }

    history.push(msg);

    const toolCalls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];
    if (!toolCalls.length) {
      onEvent && onEvent({ type: 'llm_final', round: round + 1, at: Date.now() });
      return { final: msg, messages: history, toolLogs };
    }
    onEvent && onEvent({ type: 'llm_tool_calls', round: round + 1, count: toolCalls.length, at: Date.now() });

    for (const call of toolCalls) {
      const toolName = call?.function?.name;
      const rawArgs = call?.function?.arguments || '{}';
      let args = {};
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = { _raw: rawArgs };
      }

      const log = {
        tool_call_id: call.id || `tool_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: toolName,
        args,
        started_at: Date.now(),
        result: null,
      };
      toolLogs.push(log);
      onToolStart && onToolStart(log);
      onEvent && onEvent({ type: 'tool_start', name: toolName, args, tool_call_id: log.tool_call_id, at: Date.now() });

      const handler = handlers[toolName];
      const result = handler
        ? await handler(args)
        : { ok: false, error: `unknown_tool: ${toolName}` };

      log.result = result;
      log.ended_at = Date.now();
      onToolResult && onToolResult(log);
      onEvent &&
        onEvent({
          type: 'tool_end',
          name: toolName,
          ok: !!result?.ok,
          tool_call_id: log.tool_call_id,
          summary: toolSummary(toolName, result),
          at: Date.now(),
        });

      history.push({
        role: 'tool',
        tool_call_id: log.tool_call_id,
        content: safeJsonStringify(result),
      });
    }
  }

  throw new Error(`Tool loop exceeded maxRounds=${maxRounds}`);
};
