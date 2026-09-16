import { useEffect, useState } from "react";
import { api } from "../api";
import CheckoutModal from "./CheckoutModal";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function ContentCard({ item, authorName, currentUserId, purchasedIds, onBuy, nested }) {
  const isOwn = item.author_id === currentUserId;
  const alreadyBought = purchasedIds.has(item.id);

  return (
    <div className={`card ${nested ? "reply-card" : ""}`}>
      <h3>{item.title}</h3>
      <p className="desc">{item.description}</p>
      <div className="meta-row">
        <span className={`badge status-${item.status}`}>{item.status}</span>
        {item.category && <span className="tag">{item.category}</span>}
        {item.tags.map((t) => (
          <span className="tag" key={t}>
            #{t}
          </span>
        ))}
        <span>· {authorName(item.author_id)}</span>
        <span>· {formatDate(item.created_at)}</span>
      </div>
      {item.ai_flagged && item.ai_reason && (
        <div className="flagged-note">⚠ IA: {item.ai_reason}</div>
      )}
      {item.for_sale && (
        <div className="buy-row">
          <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
          {isOwn ? (
            <span className="empty" style={{ padding: 0 }}>
              es tuyo
            </span>
          ) : alreadyBought ? (
            <span className="badge status-APPROVED">Comprado</span>
          ) : (
            <button className="primary" onClick={() => onBuy(item)}>
              Comprar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Feed({ users, currentUserId, refreshKey, onChanged }) {
  const [requests, setRequests] = useState([]);
  const [content, setContent] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyTarget, setBuyTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.listRequests(),
      api.listContent(),
      currentUserId ? api.listPurchases(currentUserId) : Promise.resolve([]),
    ])
      .then(([reqs, items, purchases]) => {
        setRequests(reqs);
        setContent(items);
        setPurchasedIds(
          new Set(purchases.filter((p) => p.status === "SUCCEEDED").map((p) => p.content_id))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey, currentUserId]);

  const authorName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;

  const handlePurchased = () => {
    load();
    onChanged?.();
  };

  if (loading) return <p className="empty">Cargando feed…</p>;
  if (error) return <div className="error-banner">{error}</div>;

  const threaded = requests.map((req) => ({
    request: req,
    replies: content.filter((c) => c.request_id === req.id),
  }));
  const standalone = content.filter((c) => c.request_id === null);

  return (
    <div>
      {threaded.length === 0 && standalone.length === 0 && (
        <p className="empty">Todavía no hay hilos ni contenido.</p>
      )}

      {threaded.map(({ request, replies }) => (
        <div className="thread" key={request.id}>
          <div className="card">
            <h3>🧵 {request.title}</h3>
            <p className="desc">{request.description}</p>
            <div className="meta-row">
              <span className={`badge status-${request.status}`}>{request.status}</span>
              <span>· pedido por {authorName(request.requester_id)}</span>
              <span>· {formatDate(request.created_at)}</span>
            </div>
          </div>
          {replies.length > 0 && (
            <div className="thread-replies">
              {replies.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  authorName={authorName}
                  currentUserId={currentUserId}
                  purchasedIds={purchasedIds}
                  onBuy={setBuyTarget}
                  nested
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {standalone.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Contenido libre</h3>
          {standalone.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              authorName={authorName}
              currentUserId={currentUserId}
              purchasedIds={purchasedIds}
              onBuy={setBuyTarget}
            />
          ))}
        </>
      )}

      {buyTarget && (
        <CheckoutModal
          item={buyTarget}
          buyerId={currentUserId}
          onClose={() => setBuyTarget(null)}
          onPurchased={() => {
            handlePurchased();
          }}
        />
      )}
    </div>
  );
}
