const normalizeErrorText = (error) => String(error?.message || error || 'unknown_error').trim();

export class AgentErrorPolicy {
  classify(error) {
    const text = normalizeErrorText(error);
    const upper = text.toUpperCase();
    if (upper.includes('ABORT')) return { kind: 'abort', retryable: false, text };
    if (upper.includes('401') || upper.includes('UNAUTHORIZED')) return { kind: 'auth', retryable: false, text };
    if (upper.includes('429') || upper.includes('RATE LIMIT')) return { kind: 'rate_limit', retryable: true, text };
    if (upper.includes('TIMEOUT') || upper.includes('FETCH') || upper.includes('NETWORK')) return { kind: 'network', retryable: true, text };
    if (upper.includes('INVALID') || upper.includes('JSON') || upper.includes('PARSE')) return { kind: 'format', retryable: true, text };
    if (upper.includes('NOT FOUND') || upper.includes('EMPTY')) return { kind: 'upstream_empty', retryable: false, text };
    return { kind: 'unknown', retryable: true, text };
  }

  shouldFallbackToSearch(domain) {
    return domain && domain !== 'search';
  }

  buildUserMessage(classification, domain) {
    if (classification.kind === 'auth') {
      return '当前 Agent 接口未通过鉴权，无法继续查询。';
    }
    if (classification.kind === 'rate_limit') {
      return '请求过于频繁，请稍后再试。';
    }
    if (classification.kind === 'abort') {
      return '已停止。';
    }
    if (classification.kind === 'upstream_empty') {
      return domain === 'course'
        ? '没有找到足够明确的课程结果，请补充学院、校区、老师或更具体的关键词。'
        : '没有找到足够明确的结果，请换更具体的关键词重试。';
    }
    return '处理时出错，请稍后重试。';
  }
}

