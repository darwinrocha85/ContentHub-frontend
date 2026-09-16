import { useState } from "react";
import { api } from "../api";

export default function ContactModal({ item, fromUserId, onClose }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.sendMessage(fromUserId, item.id, body);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Contactar sobre: {item.title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {sent ? (
          <div className="card" style={{ borderColor: "var(--ok)" }}>
            <p>✅ Mensaje enviado al autor.</p>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            {error && <div className="error-banner">{error}</div>}
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe tu mensaje…"
              required
              style={{ width: "100%" }}
            />
            <button className="primary" style={{ marginTop: 12 }} disabled={sending}>
              {sending ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
