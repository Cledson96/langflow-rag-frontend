export const allowedModelIds = ['openai/gpt-4.1-mini'] as const;

export const defaultModelId = allowedModelIds[0];

export const modelOptions = allowedModelIds.map((modelId) => ({ label: modelId, value: modelId }));
