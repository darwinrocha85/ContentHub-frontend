import { useEffect, useState } from "react";
import { api } from "../api";

export default function SubmitContentForm({ currentUserId, onSubmitted }) {
  const [openRequests, setOpenRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [requestId, setRequestId] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    api.listRequests("OPEN").then(setOpenRequests).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setLastResult(null);
    try {
      const result = await api.submitContent({
        author_id: currentUserId,
        title,
        description,
        media_url: mediaUrl || null,
        request_id: requestId ? Number(requestId) : null,
        price: price ? Number(price) : null,
      });
      setLastResult(result);
      setTitle("");
      setDescription("");
      setMediaUrl("");
      setRequestId("");
      setPrice("");
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form className="panel" onSubmit={handleSubmit}>
        <strong>Aportar contenido</strong>
        <label>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Reel del ensayo de hoy"
            required
          />
        </label>
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </label>
        <label>
          URL del archivo (opcional)
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label>
          ¿Responde a un hilo abierto? (opcional)
          <select value={requestId} onChange={(e) => setRequestId(e.target.value)}>
            <option value="">— Ninguna, es contenido libre —</option>
            {openRequests.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} · {r.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Precio en € (opcional — déjalo vacío para compartirlo gratis)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ej. 4.99"
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Analizando con IA…" : "Aportar contenido"}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {lastResult && (
        <div className="card">
          <h3>Resultado del análisis de IA</h3>
          <div className="meta-row">
            <span className={`badge status-${lastResult.status}`}>
              {lastResult.status}
            </span>
            {lastResult.category && <span className="tag">{lastResult.category}</span>}
            {lastResult.tags.map((t) => (
              <span className="tag" key={t}>
                #{t}
              </span>
            ))}
            {lastResult.for_sale && (
              <span className="price-tag">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: lastResult.currency.toUpperCase(),
                }).format(lastResult.price)}
              </span>
            )}
          </div>
          {lastResult.ai_flagged && (
            <p className="flagged-note">
              ⚠ Este contenido quedó pendiente de revisión: {lastResult.ai_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
