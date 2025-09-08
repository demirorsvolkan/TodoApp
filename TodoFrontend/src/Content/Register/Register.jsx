import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { checkUsernameExists, checkEmailExists } from '../Api/auth';  // Yolu kendine göre ayarla
import { useNavigate } from 'react-router-dom'; // yönlendirme için
import { Link } from 'react-router-dom';

export default function Register() {
  const { isAuthenticated, register } = useAuth(); // giriş durumu
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthday: '',
  });

    useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [usernameExists, setUsernameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Şifre ve doğum günü hata mesajları
  const [passwordError, setPasswordError] = useState('');
  const [birthdayError, setBirthdayError] = useState('');

  // Username değiştiğinde kontrol et
  useEffect(() => {
    if (!formData.userName) {
      setUsernameExists(false);
      return;
    }
    const delayDebounce = setTimeout(() => {
      checkUsernameExists(formData.userName)
        .then(setUsernameExists)
        .catch(() => setUsernameExists(false));
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [formData.userName]);

  // Email değiştiğinde kontrol et
  useEffect(() => {
    if (!formData.email) {
      setEmailExists(false);
      return;
    }
    const delayDebounce = setTimeout(() => {
      checkEmailExists(formData.email)
        .then(setEmailExists)
        .catch(() => setEmailExists(false));
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [formData.email]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!regex.test(password)) {
      return 'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.';
    }
    return '';
  };

  const validateBirthday = (birthday) => {
    if (!birthday) return 'Doğum tarihi zorunludur.';
    const birthDate = new Date(birthday);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate()); // 16 yaş sınırı
    if (birthDate > minDate) {
      return '16 yaşından küçükler kayıt olamaz.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordError(validatePassword(value));
    }

    if (name === 'birthday') {
      setBirthdayError(validateBirthday(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Son validasyonlar
    const pwError = validatePassword(formData.password);
    const bdError = validateBirthday(formData.birthday);
    setPasswordError(pwError);
    setBirthdayError(bdError);

    if (pwError || bdError) {
      setError('Lütfen formu doğru doldurun.');
      return;
    }

    if (usernameExists) {
      setError('Bu kullanıcı adı zaten alınmış.');
      return;
    }
    if (emailExists) {
      setError('Bu email zaten kayıtlı.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await register({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
      });
      setSuccess('Kayıt işlemi başarılı!');
      setFormData({
        userName: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthday: '',
      });
      setUsernameExists(false);
      setEmailExists(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='register-body'>
    <div className="register-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <label>
          Kullanıcı Adı
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            placeholder="Kullanıcı adınızı girin"
          />
          {usernameExists && <p style={{color: 'red', marginTop: '4px'}}>Bu kullanıcı adı zaten kayıtlı.</p>}
        </label>

        <label>
          E-posta
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="E-posta adresinizi girin"
          />
          {emailExists && <p style={{color: 'red', marginTop: '4px'}}>Bu e-posta zaten kayıtlı.</p>}
        </label>

        <label>
          Şifre
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Şifrenizi girin"
          />
          {passwordError && <p style={{color: 'red', marginTop: '4px'}}>{passwordError}</p>}
        </label>

        <label>
          İsim
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="İsminizi girin"
          />
        </label>

        <label>
          Soyisim
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Soyisminizi girin"
          />
        </label>

        <label>
          Doğum Tarihi
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
          />
          {birthdayError && <p style={{color: 'red', marginTop: '4px'}}>{birthdayError}</p>}
        </label>

        <button
          type="submit"
          disabled={
            loading ||
            usernameExists ||
            emailExists ||
            !!passwordError ||
            !!birthdayError
          }
        >
          {loading ? 'Kayıt Oluyor...' : 'Kayıt Ol'}
        </button>
        <div className="login-register-link">
           Zaten bir hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </form>
    </div>
    </div>
  );
}
