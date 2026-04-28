import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <header className="header">
        <span className="logo" onClick={() => navigate('/')}>
          📊 eva-web
        </span>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Runs
          </NavLink>
          <NavLink to="/runs/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            + New Run
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
