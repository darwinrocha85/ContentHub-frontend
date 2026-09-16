import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel, formatPrice } from "../contentTypes";
import Thumb from "./Thumb";
import ContentDetailModal from "./ContentDetailModal";

/** Perfil público de un creador de contenido: se abre al hacer click en el
 * nombre de quien publicó algo (desde el feed, el popup de detalle, o una
 * compra/venta). Muestra su catálogo de contenido aprobado -- funciona para
 * cualquier usuario, incluso si todavía no ha publicado nada. */
export default function CreatorProfileModal({ authorId, users, currentUserId, onClose }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const author = users?.find((u) => u.id === authorId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .listContent({ author_id: authorId, status: "APPROVED" })
      .then(setContent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authorId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3>
            👤 {author?.name || `Usuario #${authorId}`}
            {author?.role === "ADMIN" && (
              <span className="badge status-OPEN" style={{ marginLeft: 8 }}>
                Admin
              </span>
            )}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="desc">Contenido publicado por este usuario.</p>

        {loading && <p className="empty">Cargando…</p>}
        {error && <div className="error-banner">{error}</div>}
        {!loading && !error && content.length === 0 && (
          <p className="empty">Todavía no ha publicado contenido.</p>
        )}

        {!loading && content.length > 0 && (
          <div className="grid">
            {content.map((item) => (
              <div className="card grid-card" key={item.id} onClick={() => setSelected(item)}>
                <Thumb item={item} />
                <h3>{item.title}</h3>
                <div className="meta-row">
                  <span className={`tag ${contentTypeClass(item.content_type)}`}>
                    {contentTypeLabel(item.content_type)}
                  </span>
                  {item.is_sold && <span className="badge status-REJECTED">Vendido</span>}
                </div>
                {item.for_sale && !item.is_sold && (
                  <div className="buy-row" style={{ border: "none", paddingTop: 6 }}>
                    <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ContentDetailModal
          item={selected}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onChanged={() => {}}
        />
      )}
    </div>
  );
}
