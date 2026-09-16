import { useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeIcon, contentTypeLabel, formatPrice } from "../contentTypes";
import ContactModal from "./ContactModal";
import CheckoutModal from "./CheckoutModal";
import { useOpenCreatorProfile } from "../context/CreatorProfileContext";

function MediaPreview({ item }) {
  const [failed, setFailed] = useState(false);
  const src = api.mediaUrl(item.media_url);
  if (item.content_type === "VIDEO") {
    return <video src={src} controls style={{ width: "100%", borderRadius: 10 }} />;
  }
  if (item.content_type === "CLIP_MUSICAL") {
    return <audio src={src} controls style={{ width: "100%" }} />;
  }
  if (failed) {
    return (
      <div className={`grid-thumb ${contentTypeClass(item.content_type)}`} style={{ aspectRatio: "16 / 9" }}>
        <span className="thumb-icon">{contentTypeIcon(item.content_type)}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={item.title}
      onError={() => setFailed(true)}
      style={{ width: "100%", borderRadius: 10, display: "block" }}
    />
  );
}

export default function ContentDetailModal({ item, users, currentUserId, onClose, onChanged }) {
  const [showContact, setShowContact] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const openCreatorProfile = useOpenCreatorProfile();

  const isOwn = item.author_id === currentUserId;
  const authorName = users?.find((u) => u.id === item.author_id)?.name || `Usuario #${item.author_id}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{item.title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <MediaPreview item={item} />

        <p className="desc" style={{ marginTop: 12 }}>
          {item.description}
        </p>
        <div className="meta-row">
          <span>Publicado por</span>
          {isOwn ? (
            <strong>Tú</strong>
          ) : (
            <button className="link-name" onClick={() => openCreatorProfile(item.author_id)}>
              {authorName}
            </button>
          )}
        </div>
        <div className="meta-row">
          <span className={`tag ${contentTypeClass(item.content_type)}`}>{contentTypeLabel(item.content_type)}</span>
          {item.ai_tags.map((t) => (
            <span className="tag" key={t}>
              #{t}
            </span>
          ))}
          {item.is_sold && <span className="badge status-REJECTED">Vendido</span>}
        </div>

        {item.for_sale && (
          <div className="buy-row">
            <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
            {isOwn ? (
              <span className="badge own">👤 Tu contenido</span>
            ) : (
              !item.is_sold && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ghost" onClick={() => setShowContact(true)}>
                    Contactar
                  </button>
                  <button className="primary" onClick={() => setShowCheckout(true)}>
                    Comprar
                  </button>
                </div>
              )
            )}
          </div>
        )}
        {!item.for_sale && (
          <div className="buy-row" style={{ justifyContent: "flex-end" }}>
            {isOwn ? (
              <span className="badge own">👤 Tu contenido</span>
            ) : (
              <button className="ghost" onClick={() => setShowContact(true)}>
                Contactar
              </button>
            )}
          </div>
        )}
      </div>

      {showContact && (
        <ContactModal item={item} fromUserId={currentUserId} onClose={() => setShowContact(false)} />
      )}
      {showCheckout && (
        <CheckoutModal
          item={item}
          buyerId={currentUserId}
          onClose={() => setShowCheckout(false)}
          onPurchased={() => {
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}
