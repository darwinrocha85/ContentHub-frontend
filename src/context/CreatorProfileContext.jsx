import { createContext, useContext, useMemo, useState } from "react";
import CreatorProfileModal from "../components/CreatorProfileModal";

const CreatorProfileContext = createContext(() => {});

/** Provee una función `openCreatorProfile(authorId)` a cualquier componente
 * descendiente, sin tener que pasarla como prop por cada capa (OfferedFeed,
 * ContentDetailModal, Profile, PurchaseDetailModal...). Al llamarla, monta
 * el popup de perfil de creador una sola vez, a nivel de app. */
export function CreatorProfileProvider({ users, currentUserId, children }) {
  const [authorId, setAuthorId] = useState(null);

  const openCreatorProfile = useMemo(() => (id) => setAuthorId(id), []);

  return (
    <CreatorProfileContext.Provider value={openCreatorProfile}>
      {children}
      {authorId != null && (
        <CreatorProfileModal
          authorId={authorId}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setAuthorId(null)}
        />
      )}
    </CreatorProfileContext.Provider>
  );
}

export function useOpenCreatorProfile() {
  return useContext(CreatorProfileContext);
}
