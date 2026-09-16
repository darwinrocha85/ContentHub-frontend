export default function UserSwitcher({ users, currentUserId, onChange }) {
  return (
    <div className="user-switcher">
      <span>Actuando como</span>
      <select
        value={currentUserId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} {u.role === "ADMIN" ? "(admin)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
