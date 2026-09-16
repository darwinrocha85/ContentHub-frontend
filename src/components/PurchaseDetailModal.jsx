import { contentTypeClass, contentTypeLabel, formatPrice } from "../contentTypes";
import { useOpenCreatorProfile } from "../context/CreatorProfileContext";
import Thumb from "./Thumb";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function statusBadgeClass(status) {
  if (status === "SUCCEEDED") return "status-APPROVED";
  if (status === "FAILED") return "status-REJECTED";
  return "status-OPEN";
}

/** Detalle de una compra/venta: se abre desde las pestañas "Comprado" y
 * "Vendido" del perfil. Muestra fecha de publicación del contenido, fecha
 * de compra, y quién lo vendió/compró (con enlace al perfil del creador). */
export default function PurchaseDetailModal({ purchase, onClose }) {
  const openCreatorProfile = useOpenCreatorProfile();
  const c = purchase.content;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{purchase.content_title || c?.title || `Contenido #${purchase.content_id}`}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {c && <Thumb item={c} />}

        <div className="meta-row" style={{ marginTop: c ? 12 : 0 }}>
          <span className={`badge ${statusBadgeClass(purchase.status)}`}>{purchase.status}</span>
          {c && (
            <span className={`tag ${contentTypeClass(c.content_type)}`}>{contentTypeLabel(c.content_type)}</span>
          )}
        </div>

        <div className="detail-rows">
          <div className="detail-row">
            <span>Precio pagado</span>
            <span className="price-tag">{formatPrice(purchase.amount_cents / 100, purchase.currency)}</span>
          </div>
          <div className="detail-row">
            <span>Fecha de compra</span>
            <span>{formatDate(purchase.created_at)}</span>
          </div>
          <div className="detail-row">
            <span>Fecha de publicación</span>
            <span>{formatDate(c?.created_at)}</span>
          </div>
          <div className="detail-row">
            <span>Vendido por</span>
            <button
              className="link-name"
              onClick={() => openCreatorProfile(c?.author_id ?? purchase.seller_id)}
            >
              {purchase.seller_name || "—"}
            </button>
          </div>
          <div className="detail-row">
            <span>Comprado por</span>
            <button className="link-name" onClick={() => openCreatorProfile(purchase.buyer_id)}>
              {purchase.buyer_name || "—"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
