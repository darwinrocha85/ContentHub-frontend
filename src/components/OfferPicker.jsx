import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel, formatPrice } from "../contentTypes";

const MAX_SELECTION = 2;

export default function OfferPicker({ request, currentUserId, onClose, onOffered }) {
  const [myContent, setMyContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listContent({ author_id: currentUserId })
      .then(setMyContent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.createOffer({
        offerer_id: currentUserId,
        request_id: request.id,
        content_ids: selectedIds,
      });
      onOffered?.();
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
          <h3>Ofrecer contenido</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="desc">
          Elige hasta {MAX_SELECTION} piezas de tu contenido subido para ofrecer a "{request.title}".
        </p>

        {error && <div className="error-banner">{error}</div>}
        {loading && <p className="empty">Cargando tu contenido…</p>}
        {!loading && myContent.length === 0 && (
          <p className="empty">Todavía no has subido contenido. Ve a "Publicar" primero.</p>
        )}

        <div className="offer-picker-list">
          {myContent.map((item) => {
            const checked = selectedIds.includes(item.id);
            const disabled = !checked && selectedIds.length >= MAX_SELECTION;
            return (
              <label
                key={item.id}
                className={`offer-picker-item ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(item.id)}
                />
                <div>
                  <strong>{item.title}</strong>
                  <div className="meta-row">
                    <span className={`tag ${contentTypeClass(item.content_type)}`}>{contentTypeLabel(item.content_type)}</span>
                    {item.for_sale && <span className="price-tag">{formatPrice(item.price, item.currency)}</span>}
                    {item.is_sold && <span className="badge status-REJECTED">Vendido</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <button
          className="primary"
          style={{ marginTop: 14 }}
          disabled={submitting || selectedIds.length === 0}
          onClick={handleSubmit}
        >
          {submitting ? "Enviando…" : `Ofrecer (${selectedIds.length}/${MAX_SELECTION})`}
        </button>
      </div>
    </div>
  );
}
