import { useState } from "react";
import { api } from "../api";
import { CONTENT_TYPES } from "../contentTypes";

export default function CreateRequestModal({ currentUserId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createRequest({
        requester_id: currentUserId,
        title,
        description,
        content_type: contentType,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Solicitar contenido</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <label className="field-label">
            Título
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </label>
          <label className="field-label">
            Descripción
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label className="field-label">
            Tipo de contenido
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" disabled={submitting}>
            {submitting ? "Enviando…" : "Solicitar"}
          </button>
        </form>
      </div>
    </div>
  );
}
