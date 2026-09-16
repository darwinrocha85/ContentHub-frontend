import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel } from "../contentTypes";
import RequestDetailModal from "./RequestDetailModal";
import CreateRequestModal from "./CreateRequestModal";

export default function RequestsFeed({ users, currentUserId, refreshKey, onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .listRequests({ q: query || undefined })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey, query]);

  const requesterName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <input
          className="search-input"
          style={{ marginBottom: 0, flex: 1 }}
          placeholder="Buscar solicitudes por título o descripción…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="primary" style={{ flexShrink: 0 }} onClick={() => setShowCreate(true)}>
          + Solicitar contenido
        </button>
      </div>

      {loading && <p className="empty">Cargando…</p>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && items.length === 0 && <p className="empty">No hay solicitudes que coincidan.</p>}

      {items.map((r) => (
        <div className="card" key={r.id} onClick={() => setSelected(r)} style={{ cursor: "pointer" }}>
          <h3>{r.title}</h3>
          <p className="desc">{r.description}</p>
          <div className="meta-row">
            <span className={`badge status-${r.status}`}>{r.status}</span>
            <span className={`tag ${contentTypeClass(r.content_type)}`}>{contentTypeLabel(r.content_type)}</span>
            <span>· {requesterName(r.requester_id)}</span>
          </div>
        </div>
      ))}

      {selected && (
        <RequestDetailModal
          request={selected}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onOffered={() => {
            setSelected(null);
            onChanged?.();
          }}
        />
      )}

      {showCreate && (
        <CreateRequestModal
          currentUserId={currentUserId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            load();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}
