export default function ConversationLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando conversa"
      aria-live="polite"
      className="chat-workspace chat-boot"
      role="status"
    >
      <span>Carregando conversa…</span>
    </main>
  );
}
