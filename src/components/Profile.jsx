import { useEffect, useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeLabel, formatPrice } from "../contentTypes";
import ContentDetailModal from "./ContentDetailModal";
import PurchaseDetailModal from "./PurchaseDetailModal";

const SUBTABS = [
  { id: "uploaded", label: "Subido", icon: "⬆️" },
  { id: "purchased", label: "Comprado", icon: "💳" },
  { id: "sold", label: "Vendido", icon: "💰" },
  { id: "received", label: "Me han ofrecido", icon: "📥" },
  { id: "made", label: "Yo he ofrecido", icon: "📤" },
];

function ContentRow({ item, onClick }) {
  return (
    <div className={`card${onClick ? " clickable-card" : ""}`} onClick={onClick}>
      <h3>{item.title}</h3>
      <div className="meta-row">
        <span className={`badge status-${item.status}`}>{item.status}</span>
        <span className={`tag ${contentTypeClass(item.content_type)}`}>{contentTypeLabel(item.content_type)}</span>
        {item.for_sale && <span className="price-tag">{formatPrice(item.price, item.currency)}</span>}
        {item.is_sold && <span className="badge status-REJECTED">Vendido</span>}
      </div>
    </div>
  );
}

/** Fila de "Comprado" / "Vendido": ahora viene de un registro de Purchase
 * (con el contenido y los nombres de comprador/vendedor ya incluidos por el
 * backend), en vez de solo el contenido -- así el popup de detalle puede
 * mostrar fecha de compra y quién compró/vendió sin llamadas extra. */
function PurchaseRow({ purchase, onClick }) {
  const c = purchase.content;
  return (
    <div className="card clickable-card" onClick={onClick}>
      <h3>{purchase.content_title || c?.title || `Contenido #${purchase.content_id}`}</h3>
      <div className="meta-row">
        <span
          className={`badge status-${
            purchase.status === "SUCCEEDED" ? "APPROVED" : purchase.status === "FAILED" ? "REJECTED" : "OPEN"
          }`}
        >
          {purchase.status}
        </span>
        {c && <span className={`tag ${contentTypeClass(c.content_type)}`}>{contentTypeLabel(c.content_type)}</span>}
        <span className="price-tag">{formatPrice(purchase.amount_cents / 100, purchase.currency)}</span>
      </div>
    </div>
  );
}

function OfferRow({ offer, users, showOfferer, onContentClick }) {
  const name = (id) => users.find((u) => u.id === id)?.name || `#${id}`;
  return (
    <div className="card">
      <h3>Solicitud: {offer.request_title || `#${offer.request_id}`}</h3>
      {showOfferer && <p className="desc">Ofrecido por {name(offer.offerer_id)}</p>}
      <div className="thread-replies" style={{ marginTop: 8 }}>
        {(Array.isArray(offer.contents) ? offer.contents : []).map((c) => (
          <ContentRow item={c} key={c.id} onClick={() => onContentClick(c)} />
        ))}
      </div>
    </div>
  );
}

export default function Profile({ users, currentUserId, refreshKey, onChanged }) {
  const [subtab, setSubtab] = useState("uploaded");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const load = () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    let promise;
    if (subtab === "uploaded") promise = api.listContent({ author_id: currentUserId });
    else if (subtab === "purchased") promise = api.listPurchases(currentUserId);
    else if (subtab === "sold") promise = api.listSales(currentUserId);
    else if (subtab === "received") promise = api.listOffersReceived(currentUserId);
    else promise = api.listOffersMade(currentUserId);

    promise
      .then((result) => setData(Array.isArray(result) ? result : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [subtab, currentUserId, refreshKey]);

  return (
    <div>
      <nav className="tabs" style={{ marginBottom: 16 }}>
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            className={subtab === t.id ? "active" : ""}
            onClick={() => {
              // Limpiamos `data` en el mismo handler que cambia `subtab`, para que
              // React aplique ambos cambios en el mismo commit. Si solo cambiáramos
              // `subtab` aquí y dejáramos que un useEffect limpiara `data` después,
              // habría un frame renderizando la rama de la pestaña nueva (p.ej.
              // OfferRow, que espera `offer.contents`) contra los datos viejos de la
              // pestaña anterior (p.ej. ContentOut plano, sin `.contents`) -- eso es
              // lo que rompía la pantalla en blanco al cambiar de pestaña.
              setData([]);
              setSubtab(t.id);
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {loading && <p className="empty">Cargando…</p>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && !error && data.length === 0 && <p className="empty">Nada por aquí todavía.</p>}

      {!loading &&
        subtab === "uploaded" &&
        data.map((item) => <ContentRow item={item} key={item.id} onClick={() => setSelectedContent(item)} />)}

      {!loading &&
        subtab === "purchased" &&
        data.map((p) => <PurchaseRow purchase={p} key={p.id} onClick={() => setSelectedPurchase(p)} />)}

      {!loading &&
        subtab === "sold" &&
        data.map((p) => <PurchaseRow purchase={p} key={p.id} onClick={() => setSelectedPurchase(p)} />)}

      {!loading &&
        subtab === "received" &&
        data.map((o) => (
          <OfferRow offer={o} users={users} showOfferer onContentClick={setSelectedContent} key={o.id} />
        ))}

      {!loading &&
        subtab === "made" &&
        data.map((o) => <OfferRow offer={o} users={users} onContentClick={setSelectedContent} key={o.id} />)}

      {selectedContent && (
        <ContentDetailModal
          item={selectedContent}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setSelectedContent(null)}
          onChanged={() => {
            load();
            onChanged?.();
          }}
        />
      )}

      {selectedPurchase && (
        <PurchaseDetailModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />
      )}
    </div>
  );
}
