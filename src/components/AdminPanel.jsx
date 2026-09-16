import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel } from "../contentTypes";
import { useOpenCreatorProfile } from "../context/CreatorProfileContext";

export default function AdminPanel({ currentUserId, users, refreshKey, onChanged }) {
  const [overview, setOverview] = useState(null);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const openCreatorProfile = useOpenCreatorProfile();

  const authorName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.adminOverview(currentUserId),
      api.adminPending(currentUserId),
    ])
      .then(([ov, pend]) => {
        setOverview(ov);
        setPending(pend);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentUserId, refreshKey]);

  const moderate = async (id, approve) => {
    try {
      await api.moderateContent(id, currentUserId, approve);
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="empty">Cargando panel de admin…</p>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div>
      {overview && (
        <div className="stats-grid">
          <div className="stat">
            <div className="value">🎬 {overview.total_content}</div>
            <div className="label">Contenido total</div>
          </div>
          <div className="stat">
            <div className="value">⏳ {overview.pending_review}</div>
            <div className="label">Pendiente de revisión</div>
          </div>
          <div className="stat">
            <div className="value">🙋 {overview.open_requests}</div>
            <div className="label">Solicitudes abiertas</div>
          </div>
          <div className="stat">
            <div className="value">👥 {overview.total_users}</div>
            <div className="label">Usuarios</div>
          </div>
          <div className="stat">
            <div className="value">💰 {overview.sold_content}</div>
            <div className="label">Vendidos</div>
          </div>
        </div>
      )}

      {overview && overview.top_tags.length > 0 && (
        <div className="card">
          <h3>Etiquetas más usadas</h3>
          <div className="meta-row">
            {overview.top_tags.map(([tag, count]) => (
              <span className="tag" key={tag}>
                #{tag} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 24 }}>Cola de moderación</h3>
      {pending.length === 0 && (
        <p className="empty">No hay contenido pendiente de revisión.</p>
      )}
      {pending.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.title}</h3>
          <p className="desc">{item.description}</p>
          <div className="meta-row">
            <button className="link-name" onClick={() => openCreatorProfile(item.author_id)}>
              {authorName(item.author_id)}
            </button>
            <span className={`tag ${contentTypeClass(item.content_type)}`}>{contentTypeLabel(item.content_type)}</span>
          </div>
          {item.ai_reason && <p className="flagged-note">⚠ IA: {item.ai_reason}</p>}
          <div className="meta-row" style={{ marginTop: 10 }}>
            <button className="ghost approve" onClick={() => moderate(item.id, true)}>
              Aprobar
            </button>
            <button className="ghost reject" onClick={() => moderate(item.id, false)}>
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
