export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE =
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_TYPE =
  process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID =
  process.env.AZURE_DEPLOYMENT_ID || '';

export const OPENAI_ASSISTANT_ID =
  process.env.OPENAI_ASSISTANT_ID || '';

export const MONGO_URI =
  process.env.MONGO_URI || '';

export const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || '';

export const MYSQL_HOST =
  process.env.MYSQL_HOST || '';

export const MYSQL_USER =
  process.env.MYSQL_USER || '';

export const MYSQL_PASS =
  process.env.MYSQL_PASS || '';

export const MYSQL_DB =
  process.env.MYSQL_DB || '';

  export const LF_DEBUG =
  process.env.LF_DEBUG || true;
