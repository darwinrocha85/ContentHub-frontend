import { useState } from "react";
import { contentTypeClass, contentTypeLabel } from "../contentTypes";
import OfferPicker from "./OfferPicker";

export default function RequestDetailModal({ request, users, currentUserId, onClose, onOffered }) {
  const [showPicker, setShowPicker] = useState(false);
  const requesterName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;
  const isOwn = request.requester_id === currentUserId;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{request.title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="desc">{request.description}</p>
        <div className="meta-row">
          <span className={`badge status-${request.status}`}>{request.status}</span>
          <span className={`tag ${contentTypeClass(request.content_type)}`}>{contentTypeLabel(request.content_type)}</span>
          <span>· pedido por {requesterName(request.requester_id)}</span>
        </div>

        {!isOwn && request.status === "OPEN" && (
          <button className="primary" style={{ marginTop: 16 }} onClick={() => setShowPicker(true)}>
            Ofrecer contenido
          </button>
        )}
        {isOwn && (
          <p className="empty" style={{ paddingTop: 16 }}>
            Es tu propia solicitud — mira las ofertas en tu pestaña "Me han ofrecido".
          </p>
        )}
      </div>

      {showPicker && (
        <OfferPicker
          request={request}
          currentUserId={currentUserId}
          onClose={() => setShowPicker(false)}
          onOffered={onOffered}
        />
      )}
    </div>
  );
}
