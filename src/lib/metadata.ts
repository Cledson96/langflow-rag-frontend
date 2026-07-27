const fallbackPublicAppUrl = 'https://app-langflow.cledson.com.br';

export const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? fallbackPublicAppUrl);

export const siteMetadata = {
  description: 'Converse com seus documentos usando recuperação aumentada por geração.',
  name: 'Langflow RAG',
} as const;

export function publicUrl(pathname: string): string {
  return new URL(pathname, metadataBase).toString();
}
