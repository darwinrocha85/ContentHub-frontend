import { useEffect, useState } from "react";
import { api } from "../api";

export default function RequestsBoard({ users, currentUserId, refreshKey, onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .listRequests()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey]);

  const requesterName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createRequest({
        requester_id: currentUserId,
        title,
        description,
      });
      setTitle("");
      setDescription("");
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await api.closeRequest(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form className="panel" onSubmit={handleSubmit}>
        <strong>Nueva solicitud de contenido</strong>
        <label>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Video corto para el lanzamiento del single"
            required
          />
        </label>
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="¿Qué necesitas exactamente y para cuándo?"
            required
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Enviando…" : "Solicitar contenido"}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="empty">Cargando solicitudes…</p>}
      {!loading && items.length === 0 && (
        <p className="empty">No hay solicitudes todavía.</p>
      )}

      {items.map((r) => (
        <div className="card" key={r.id}>
          <h3>{r.title}</h3>
          <p className="desc">{r.description}</p>
          <div className="meta-row">
            <span className={`badge status-${r.status}`}>{r.status}</span>
            <span>· pedida por {requesterName(r.requester_id)}</span>
            {r.status === "OPEN" && r.requester_id === currentUserId && (
              <button className="ghost" onClick={() => handleClose(r.id)}>
                Cerrar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
