import { useState } from 'react';
import { loginUser } from '../Api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, checking } = useAuth();


  useEffect(() => {
    if (isAuthenticated && !checking) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, checking, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ identifier, password });
      await login(data.token); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Giriş Yap</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          type="text"
          placeholder="Email veya Kullanıcı Adı"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          className="login-input"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Parola"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
          disabled={loading}
        />
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş'}
        </button>

        <p className="login-register-link">
          Henüz bir hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </p>

      </form>
    </div>
  );
}
