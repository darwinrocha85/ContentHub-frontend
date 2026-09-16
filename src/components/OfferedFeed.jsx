import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel, formatPrice } from "../contentTypes";
import ContentDetailModal from "./ContentDetailModal";
import Thumb from "./Thumb";
import { useOpenCreatorProfile } from "../context/CreatorProfileContext";

export default function OfferedFeed({ users, currentUserId, refreshKey, onChanged }) {
  const openCreatorProfile = useOpenCreatorProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .listContent({ for_sale: true, status: "APPROVED", is_sold: false, q: query || undefined })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey, query]);

  const authorName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;

  return (
    <div>
      <input
        className="search-input"
        placeholder="Buscar por título o descripción…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="empty">Cargando…</p>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && items.length === 0 && (
        <p className="empty">No hay contenido en venta que coincida.</p>
      )}

      <div className="grid">
        {items.map((item) => (
          <div className="card grid-card" key={item.id} onClick={() => setSelected(item)}>
            <Thumb item={item} />
            <h3>{item.title}</h3>
            <div className="meta-row">
              <span className={`tag ${contentTypeClass(item.content_type)}`}>{contentTypeLabel(item.content_type)}</span>
              <span>
                ·{" "}
                <button
                  className="link-name"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreatorProfile(item.author_id);
                  }}
                >
                  {authorName(item.author_id)}
                </button>
              </span>
            </div>
            <div className="buy-row" style={{ border: "none", paddingTop: 6 }}>
              <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ContentDetailModal
          item={selected}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onChanged={() => {
            load();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}
