import React, { useState } from 'react';
import '../../css/panel_left.css';

const LeftPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Xử lý đăng nhập ở đây
    console.log('Đăng nhập với:', formData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({ username: '', password: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <aside className="left-panel">
      <div className="login-container">
        <h3>Đăng nhập</h3>
        
        {isLoggedIn ? (
          <div className="logged-in">
            <div className="user-info">
              <p>Chào mừng, <strong>{formData.username}</strong>!</p>
              <p>Bạn đã đăng nhập thành công.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Nhập username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>
            
            <button type="submit" className="login-btn">
              Đăng nhập
            </button>
            
            <div className="login-links">
              <a href="/forgot-password">Quên mật khẩu?</a>
              <a href="/register">Đăng ký tài khoản</a>
            </div>
          </form>
        )}
      </div>
      
      <div className="left-menu">
        <h4>Menu</h4>
        <ul>
          <li><a href="/profile">Hồ sơ</a></li>
          <li><a href="/settings">Cài đặt</a></li>
          <li><a href="/messages">Tin nhắn</a></li>
          <li><a href="/notifications">Thông báo</a></li>
        </ul>
      </div>
    </aside>
  );
};

export default LeftPanel;