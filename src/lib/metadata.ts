const fallbackPublicAppUrl = 'https://app-langflow.cledson.com.br';

export const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? fallbackPublicAppUrl);

export const siteMetadata = {
  description: 'Assistente inteligente da Gobrax com memória de projetos, pesquisa e automações.',
  name: 'Gobrax AI',
} as const;

export function publicUrl(pathname: string): string {
  return new URL(pathname, metadataBase).toString();
}
