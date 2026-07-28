'use client';

import { Bubble, Conversations, Sender } from '@ant-design/x';
import type { BubbleItemType } from '@ant-design/x/es/bubble';
import {
  BookOutlined,
  CheckOutlined,
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  UserOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Button, Collapse, Flex, Input, Select, Spin, Tag, Tooltip, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { forwardRef, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { sendMessageResponseSchema } from '@/types/schemas';
import type { AIModel, Conversation, Message } from '@/types/api';

type ChatClientProps = {
  conversation: Conversation;
  conversations: Conversation[];
  initialMessages: Message[];
  models: AIModel[];
  projectId: string;
};

type VisibleMessage = {
  content: string;
  sources: string[];
};

const unavailableMessage = 'Não foi possível enviar a mensagem. Tente novamente.';
const AccessibleSenderInput = forwardRef<
  React.ComponentRef<typeof Input.TextArea>,
  React.ComponentProps<typeof Input.TextArea>
>(function AccessibleSenderInput(props, reference) {
  return <Input.TextArea {...props} aria-label="Mensagem" ref={reference} />;
});

function visibleMessage(messageItem: Message): VisibleMessage {
  const lines = messageItem.content.split(/\r?\n/);
  const sourceIndex = lines.findIndex((line) => /^\s*(?:fonte|source)\s*:/i.test(line));
  const legacySources = sourceIndex < 0
    ? []
    : lines.slice(sourceIndex).map((line) => line.replace(/^\s*(?:fonte|source)\s*:\s*/i, '').trim()).filter(Boolean);
  const metadataSources = [
    ...(messageItem.metadata?.sources?.map((source) => source.displayName) ?? []),
    ...(messageItem.metadata?.source?.displayName ? [messageItem.metadata.source.displayName] : []),
  ];

  return {
    content: (sourceIndex < 0 ? messageItem.content : lines.slice(0, sourceIndex).join('\n')).trim(),
    sources: [...new Set([...metadataSources, ...legacySources])],
  };
}

function usageText(messageItem: Message): string | undefined {
  const usage = messageItem.metadata?.usage;
  if (usage?.totalTokens !== undefined) return `${usage.totalTokens} tokens`;
  const total = (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);
  return total > 0 ? `${total} tokens` : undefined;
}

function AssistantFooter({ item }: Readonly<{ item: Message }>) {
  const visible = visibleMessage(item);
  const usage = usageText(item);
  const tools = item.metadata?.tools ?? [];

  if (visible.sources.length === 0 && tools.length === 0 && usage === undefined) return null;

  return (
    <div className="message-footer">
      {tools.length > 0 ? (
        <Flex gap={6} wrap>
          {tools.map((tool, index) => (
            <Tag
              color={tool.status === 'completed' ? 'success' : 'error'}
              icon={<ToolOutlined />}
              key={`${tool.name}-${index}`}
            >
              {tool.label}
            </Tag>
          ))}
        </Flex>
      ) : null}
      {visible.sources.length > 0 ? (
        <Collapse
          ghost
          items={[{
            children: (
              <div className="source-list">
                {visible.sources.map((source) => (
                  <div className="source-item" key={source}><BookOutlined /> <span>{source}</span></div>
                ))}
              </div>
            ),
            key: 'sources',
            label: `${visible.sources.length} ${visible.sources.length === 1 ? 'fonte consultada' : 'fontes consultadas'}`,
          }]}
          size="small"
        />
      ) : null}
      {usage ? <Typography.Text className="usage-text" type="secondary">{usage}</Typography.Text> : null}
    </div>
  );
}

export default function ChatClient({
  conversation: initialConversation,
  conversations,
  initialMessages,
  models,
  projectId,
}: Readonly<ChatClientProps>) {
  const router = useRouter();
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState(false);
  const [changingModel, setChangingModel] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  const items = useMemo<BubbleItemType[]>(() => {
    const chronological = [...messages].sort((first, second) => first.createdAt.localeCompare(second.createdAt));
    return chronological
      .filter((item) => item.role === 'USER' || item.role === 'ASSISTANT')
      .map((item) => {
        const visible = visibleMessage(item);
        const isUser = item.role === 'USER';
        return {
          avatar: isUser
            ? <Avatar className="user-avatar" icon={<UserOutlined />} />
            : <Avatar className="assistant-avatar" icon={<RobotOutlined />} />,
          content: isUser ? visible.content : (
            <div className="markdown-message">
              <Markdown remarkPlugins={[remarkGfm]}>{visible.content}</Markdown>
            </div>
          ),
          footer: isUser ? undefined : <AssistantFooter item={item} />,
          key: item.id,
          role: isUser ? 'user' : 'ai',
        };
      });
  }, [messages]);

  async function sendMessage(contentValue: string): Promise<void> {
    const trimmed = contentValue.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/projects/${projectId}/conversations/${conversation.id}/messages`, {
        body: JSON.stringify({ content: trimmed }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload: unknown = await response.json().catch((): undefined => undefined);
      const parsed = sendMessageResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) throw new Error(unavailableMessage);
      setMessages((current) => [...current, parsed.data.userMessage, parsed.data.assistantMessage]);
      setContent('');
    } catch {
      setError(unavailableMessage);
    } finally {
      setPending(false);
    }
  }

  async function changeModel(modelId: string): Promise<void> {
    if (modelId === conversation.modelId || changingModel) return;
    setChangingModel(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/conversations/${conversation.id}`, {
        body: JSON.stringify({ modelId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const payload: unknown = await response.json().catch((): undefined => undefined);
      if (!response.ok || typeof payload !== 'object' || payload === null || !('conversation' in payload)) {
        throw new Error();
      }
      setConversation((current) => ({ ...current, modelId }));
      void messageApi.success({ content: 'Modelo alterado para esta conversa.', icon: <CheckOutlined /> });
    } catch {
      void messageApi.error('Não foi possível trocar o modelo.');
    } finally {
      setChangingModel(false);
    }
  }

  return (
    <main className="chat-workspace">
      {contextHolder}
      <aside className="conversation-rail">
        <Flex align="center" justify="space-between">
          <Typography.Text strong>Conversas</Typography.Text>
          <Tooltip title="Nova conversa">
            <Button
              aria-label="Nova conversa"
              icon={<PlusOutlined />}
              onClick={() => router.push(`/projects/${projectId}`)}
              shape="circle"
              size="small"
              type="text"
            />
          </Tooltip>
        </Flex>
        <Conversations
          activeKey={conversation.id}
          items={conversations.map((item) => ({
            icon: <MessageOutlined />,
            key: item.id,
            label: item.title ?? 'Conversa sem título',
          }))}
          onActiveChange={(key) => router.push(`/projects/${projectId}/conversations/${key}`)}
        />
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <Typography.Title ellipsis level={3}>{conversation.title ?? 'Conversa sem título'}</Typography.Title>
            <Typography.Text type="secondary">Memória do projeto conectada</Typography.Text>
          </div>
          <Flex align="center" gap={8}>
            <Typography.Text className="model-label" type="secondary">Modelo</Typography.Text>
            <Select
              loading={changingModel}
              onChange={(value) => void changeModel(value)}
              options={models.map((model) => ({
                label: (
                  <Flex align="center" gap={8}>
                    <RobotOutlined />
                    <span>{model.name}</span>
                    {model.isDefault ? <Tag variant="filled">Padrão</Tag> : null}
                  </Flex>
                ),
                value: model.id,
              }))}
              popupMatchSelectWidth={280}
              value={conversation.modelId}
            />
          </Flex>
        </header>

        <div className="chat-scroll">
          {items.length === 0 ? (
            <div className="chat-empty">
              <span><RobotOutlined /></span>
              <Typography.Title level={2}>Como posso ajudar?</Typography.Title>
              <Typography.Paragraph>
                Faça uma pergunta sobre os documentos e a memória deste projeto.
              </Typography.Paragraph>
            </div>
          ) : (
            <Bubble.List
              autoScroll
              items={items}
              role={{
                ai: { placement: 'start', shape: 'corner', variant: 'borderless' },
                user: { placement: 'end', shape: 'corner', variant: 'filled' },
              }}
            />
          )}
          {pending ? (
            <div className="assistant-thinking"><Spin size="small" /> Consultando sua memória e preparando a resposta…</div>
          ) : null}
        </div>

        <footer className="composer-wrap">
          {error ? <Alert closable title={error} onClose={() => setError(undefined)} showIcon type="error" /> : null}
          <Sender
            autoSize={{ maxRows: 7, minRows: 1 }}
            components={{ input: AccessibleSenderInput }}
            disabled={pending}
            loading={pending}
            onChange={setContent}
            onSubmit={(value) => void sendMessage(value)}
            placeholder="Pergunte qualquer coisa sobre este projeto…"
            submitType="enter"
            suffix={(_original, { components }) => <components.SendButton aria-label="Enviar" disabled={pending} />}
            value={content}
          />
          <Typography.Text type="secondary">A IA pode cometer erros. Confirme informações importantes.</Typography.Text>
        </footer>
      </section>
    </main>
  );
}
