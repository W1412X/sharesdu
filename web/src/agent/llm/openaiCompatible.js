const normalizeBaseUrl = (baseUrl) => {
  const trimmed = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.endsWith('/v1')) return trimmed;
  return `${trimmed}/v1`;
};

export const createOpenAICompatibleClient = ({ baseUrl, apiKey }) => {
  const normalized = normalizeBaseUrl(baseUrl);

  const createChatCompletion = async ({
    model,
    messages,
    tools,
    tool_choice,
    temperature,
    max_tokens,
    signal,
  }) => {
    const url = `${normalized}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
        tool_choice,
        temperature,
        max_tokens,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`LLM request failed: ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }

    return await res.json();
  };

  return { createChatCompletion };
};

