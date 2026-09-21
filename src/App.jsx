import { useEffect, useState } from "react";
import { api } from "./api";
import UserSwitcher from "./components/UserSwitcher";
import OfferedFeed from "./components/OfferedFeed";
import RequestsFeed from "./components/RequestsFeed";
import PublishContentForm from "./components/PublishContentForm";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import { CreatorProfileProvider } from "./context/CreatorProfileContext";

const TABS = [
  { id: "offered", label: "Publicado", icon: "🔥" },
  { id: "requested", label: "Requerido", icon: "🙋" },
  { id: "publish", label: "Publicar", icon: "⬆️" },
  { id: "profile", label: "Mi perfil", icon: "👤" },
  { id: "admin", label: "Admin", icon: "🛠️", adminOnly: true },
];

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [tab, setTab] = useState("offered");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    api
      .listUsers()
      .then((list) => {
        setUsers(list);
        if (list.length > 0) setCurrentUserId(list[0].id);
      })
      .catch((e) =>
        setLoadError(
          `No se pudo conectar con el backend (${e.message}). ¿Está corriendo en ${
            import.meta.env.VITE_API_URL || "http://localhost:8002"
          }?`
        )
      );
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId);
  const isAdmin = currentUser?.role === "ADMIN";
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <CreatorProfileProvider users={users} currentUserId={currentUserId}>
      <header className="app-header">
        <div className="brand-row">
          <span className="brand-mark">🎧</span>
          <div>
            <h1>ContentHub</h1>
            <p>
              Publica y pide contenido, ofrece lo tuyo a las solicitudes de otros, y compra lo
              que te guste — con moderación por IA y pagos con Stripe.
            </p>
          </div>
        </div>
        {users.length > 0 && (
          <UserSwitcher users={users} currentUserId={currentUserId} onChange={setCurrentUserId} />
        )}
      </header>

      {loadError && <div className="error-banner">{loadError}</div>}

      {!loadError && currentUserId && (
        <>
          <nav className="tabs">
            {TABS.filter((t) => !t.adminOnly || isAdmin).map((t) => (
              <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          {tab === "offered" && (
            <ErrorBoundary key={tab}>
              <OfferedFeed users={users} currentUserId={currentUserId} refreshKey={refreshKey} onChanged={bump} />
            </ErrorBoundary>
          )}
          {tab === "requested" && (
            <ErrorBoundary key={tab}>
              <RequestsFeed users={users} currentUserId={currentUserId} refreshKey={refreshKey} onChanged={bump} />
            </ErrorBoundary>
          )}
          {tab === "publish" && (
            <ErrorBoundary key={tab}>
              <PublishContentForm currentUserId={currentUserId} onPublished={bump} />
            </ErrorBoundary>
          )}
          {tab === "profile" && (
            <ErrorBoundary key={tab}>
              <Profile users={users} currentUserId={currentUserId} refreshKey={refreshKey} onChanged={bump} />
            </ErrorBoundary>
          )}
          {tab === "admin" && isAdmin && (
            <ErrorBoundary key={tab}>
              <AdminPanel currentUserId={currentUserId} users={users} refreshKey={refreshKey} onChanged={bump} />
            </ErrorBoundary>
          )}
        </>
      )}
    </CreatorProfileProvider>
  );
}
