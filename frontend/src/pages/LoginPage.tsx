import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('demo@cttshop.com');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/search', { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/search', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <span className="eyebrow">Panel demo flow</span>
        <h1>Show login quickly, then move straight into search and product details.</h1>
        <p>
          The seeded credentials are already filled so you can focus on the demo script instead of setup
          friction.
        </p>
      </div>
      <form className="panel" onSubmit={handleSubmit}>
        <h2>{user ? 'You are logged in' : 'Sign in'}</h2>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </section>
  );
}
