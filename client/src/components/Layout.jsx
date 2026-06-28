import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="brand">ProdScreen</h1>
        <nav className="menu">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/process/default">Process entry</NavLink>
          <NavLink to="/admin/factories">Factories</NavLink>
          <NavLink to="/admin/table-gallery">Table gallery</NavLink>
          <NavLink to="/admin/shift-config">Shift config</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
        </nav>
      </aside>
      <div className="content">
        <header className="header">
          <div>
            <strong>{user?.name}</strong>
            <p className="muted">{user?.role}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Sign out
          </button>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
