import { useState } from "react";
import { api } from "../api";
import { CONTENT_TYPES, formatPrice } from "../contentTypes";

export default function PublishContentForm({ currentUserId, onPublished }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].value);
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Selecciona un archivo para subir");
      return;
    }
    setSubmitting(true);
    setError(null);
    setLastResult(null);
    try {
      const { url } = await api.uploadFile(file);
      const result = await api.publishContent({
        author_id: currentUserId,
        title,
        description,
        content_type: contentType,
        media_url: url,
        price: price ? Number(price) : null,
      });
      setLastResult(result);
      setTitle("");
      setDescription("");
      setFile(null);
      setPrice("");
      e.target.reset();
      onPublished?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form className="panel" onSubmit={handleSubmit}>
        <strong>Publicar contenido</strong>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Descripción
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Tipo de contenido
          <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Archivo
          <input
            type="file"
            accept={contentType === "FOTO" ? "image/*" : contentType === "VIDEO" ? "video/*" : "audio/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
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
          {submitting ? "Subiendo y analizando con IA…" : "Publicar"}
        </button>
      </form>

      {lastResult && (
        <div className="card">
          <h3>Publicado: {lastResult.title}</h3>
          <div className="meta-row">
            <span className={`badge status-${lastResult.status}`}>{lastResult.status}</span>
            {lastResult.ai_tags.map((t) => (
              <span className="tag" key={t}>
                #{t}
              </span>
            ))}
            {lastResult.for_sale && (
              <span className="price-tag">{formatPrice(lastResult.price, lastResult.currency)}</span>
            )}
          </div>
          {lastResult.ai_flagged && (
            <p className="flagged-note">
              ⚠ Quedó pendiente de revisión de un admin antes de aparecer en el feed: {lastResult.ai_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
