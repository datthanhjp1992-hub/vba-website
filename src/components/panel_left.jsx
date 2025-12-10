//[file name]: panel_left.jsx

import React, { useState, useEffect } from 'react';
import '../css/panel_left.css';
import AccountService from '../services/account_service';

const LeftPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    account: '',
    password: '',
  });
  const [userData, setUserData] = useState(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authStatus = await AccountService.checkAuthStatus();
      
      if (authStatus.isAuthenticated) {
        setIsLoggedIn(true);
        setUserData(authStatus.user);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập với API
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Gọi API đăng nhập
      const result = await AccountService.login(formData.account, formData.password);
      
      if (result.success) {
        // Lưu thông tin đăng nhập
        AccountService.saveLoginData(result.data);
        
        // Cập nhật state
        setIsLoggedIn(true);
        setUserData(result.data);
        
        // Reset form
        setFormData({ account: '', password: '' });
        
        console.log('Đăng nhập thành công:', result.data);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    AccountService.clearLoginData();
    setIsLoggedIn(false);
    setUserData(null);
    setErrorMessage('');
    console.log('Đã đăng xuất');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message khi user bắt đầu nhập
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Render form đăng nhập (trạng thái chưa đăng nhập)
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="login-form-state fade-in">
      {errorMessage && (
        <div className="error-message" style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="account">Tài khoản:</label>
        <input
          type="text"
          id="account"
          name="account"
          value={formData.account}
          onChange={handleInputChange}
          required
          placeholder="Nhập tài khoản"
          autoComplete="username"
          disabled={isLoading}
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
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>
      
      <button 
        type="submit" 
        className="login-btn"
        disabled={isLoading}
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      
      <div className="login-links">
        <a href="/forgot-password">Quên mật khẩu?</a>
        <a href="/register">Đăng ký tài khoản</a>
      </div>
      
      {/* Demo accounts */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#666'
      }}>
        <strong>Demo accounts:</strong>
        <div style={{ marginTop: '0.25rem' }}>
          <div>admin / admin123</div>
          <div>user1 / user123</div>
          <div>moderator / mod123</div>
        </div>
      </div>
    </form>
  );

  // Render thông tin đã đăng nhập (trạng thái đã đăng nhập)
  const renderLoggedInState = () => (
    <div className="logged-in-state fade-in">
      <div className="user-info">
        <p>Chào mừng trở lại!</p>
        <p>Tài khoản: <strong>{userData?.account}</strong></p>
        <p>Tên hiển thị: <strong>{userData?.username}</strong></p>
        <p>Quyền hạn: 
          <span style={{
            color: userData?.authorities === 1 ? '#28a745' : 
                   userData?.authorities === 2 ? '#ffc107' : '#007bff',
            marginLeft: '0.5rem'
          }}>
            {userData?.authorities === 1 ? 'Admin' : 
             userData?.authorities === 2 ? 'Moderator' : 'User'}
          </span>
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Đăng nhập lúc: {new Date().toLocaleTimeString()}
        </p>
      </div>
      <button 
        onClick={handleLogout}
        className="logout-btn"
        disabled={isLoading}
        aria-label="Đăng xuất khỏi tài khoản"
      >
        {isLoading ? 'Đang xử lý...' : 'Đăng xuất'}
      </button>
    </div>
  );

  return (
    <aside className="left-panel">
      <div className="login-container">
        <h3>{isLoggedIn ? 'Tài khoản của bạn' : 'Đăng nhập'}</h3>
        
        {/* Hiển thị trạng thái tương ứng */}
        {isLoggedIn ? renderLoggedInState() : renderLoginForm()}
      </div>
      
      {/* Menu điều hướng */}
      <div className="left-menu">
        <h4>Menu điều hướng</h4>
        <ul>
          <li><a href="/">🏠 Trang chủ</a></li>
          <li><a href="/profile">👤 Hồ sơ cá nhân</a></li>
          <li><a href="/settings">⚙️ Cài đặt tài khoản</a></li>
          {isLoggedIn && (
            <>
              <li><a href="/messages">✉️ Tin nhắn</a></li>
              <li><a href="/notifications">🔔 Thông báo</a></li>
              {userData?.authorities > 0 && (
                <li><a href="/admin">👑 Quản trị</a></li>
              )}
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default LeftPanel;
