import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <header className="header">
        <div>
          <h1>ProdScreen</h1>
          <p>Production, quality, and shift performance tracking</p>
        </div>
        <div className="header-meta">
          <span>{user?.name} ({user?.role})</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <nav className="tabs">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/input">Input Screen</NavLink>
        {(user?.role === "admin" || user?.role === "supervisor") && <NavLink to="/admin">Admin Setup</NavLink>}
      </nav>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
};
