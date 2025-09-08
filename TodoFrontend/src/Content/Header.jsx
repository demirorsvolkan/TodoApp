import { useAuth } from './AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header>
      <div className="user-info">
        {user ? `${user.firstName} ${user.lastName}` : 'Misafir'}
      </div>
      <button
        className="menu-toggle"
        onClick={toggleMenu}
        ref={buttonRef}
        aria-label="Kullanıcı menüsünü aç"
      >
        &#9776;
      </button>

      {menuOpen && (
        <div className="dropdown-menu" ref={menuRef}>
          <button onClick={() => { logout(); setMenuOpen(false); }}>
            Çıkış Yap
          </button>
        </div>
      )}
    </header>
  );
}
