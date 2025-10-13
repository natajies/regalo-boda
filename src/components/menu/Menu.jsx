import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './Menu.scss';

const Menu = ({ photoURL, displayName }) => {
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-infouser')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUserMenuClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <div className="menu">
      <div className="menu-infouser" onClick={handleUserMenuClick}>
        <div className="menu-infouser-foto">
          {photoURL && <img src={photoURL} alt="User" />}
        </div>
        <div className="menu-infouser-nombre">
          {displayName ? displayName : 'Usuario'}
        </div>
        <div className="menu-infouser-arrow">
          <div
            className={`arrow ${showDropdown ? 'arrow-up' : 'arrow-down'}`}
          />
        </div>
      </div>

      {/* Menú desplegable */}
      {showDropdown && (
        <div className="menu-dropdown">
          <div className="menu-dropdown-item logout" onClick={handleLogout}>
            Cerrar Sesión
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
