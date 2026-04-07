import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { demoConfig } from '../config/demo';

export function AppLayout() {
  const { user, logout } = useAuth();
  const homePath = user ? '/search' : '/login';

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to={homePath}>
          <span className="brand-mark">CTT</span>
          <div>
            <strong>Online Shopping Demo</strong>
            <p>Live GUID: {demoConfig.guid}</p>
          </div>
        </Link>
        <nav className="nav">
          {user ? <NavLink to="/search">Search</NavLink> : null}
          <NavLink to="/login">{user ? 'Account' : 'Login'}</NavLink>
        </nav>
        <div className="session-card">
          {user ? (
            <>
              <span>{user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : null}
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
