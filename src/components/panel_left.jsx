//[file name]: panel_left.jsx
//[file content begin]
import React, { useState, useEffect } from 'react';
import '../css/panel_left.css';
import AccountService from '../services/account_service';
import { 
    VALIDATION_RULES,
    ERROR_MESSAGES,
    DEMO_ACCOUNTS,
    getAuthorityName,
    getAuthorityColor,
    validateAccount,
    validatePassword
} from '../services/constants';

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
      // Validate trước khi gửi
      const accountValidation = validateAccount(formData.account);
      if (!accountValidation.valid) {
        throw new Error(accountValidation.message);
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

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
      setErrorMessage(error.message || ERROR_MESSAGES.LOGIN_FAILED);
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
          placeholder={`Nhập tài khoản (${VALIDATION_RULES.ACCOUNT.MIN_LENGTH}-${VALIDATION_RULES.ACCOUNT.MAX_LENGTH} ký tự)`}
          autoComplete="username"
          disabled={isLoading}
        />
        <small style={{ color: '#666', fontSize: '0.8rem' }}>
          Chỉ được dùng chữ cái, số và dấu gạch dưới
        </small>
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
          placeholder={`Nhập mật khẩu (ít nhất ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} ký tự)`}
          autoComplete="current-password"
          disabled={isLoading}
        />
        <small style={{ color: '#666', fontSize: '0.8rem' }}>
          Phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số
        </small>
      </div>
      
      <button 
        type="submit" 
        className="login-btn"
        disabled={isLoading || !formData.account || !formData.password}
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      
      <div className="login-links">
        <a href="/forgot-password">Quên mật khẩu?</a>
        <a href="/register">Đăng ký tài khoản</a>
      </div>
      
    </form>
  );

  // Render thông tin đã đăng nhập (trạng thái đã đăng nhập)
  const renderLoggedInState = () => {
    const authorityName = getAuthorityName(userData?.authorities);
    const authorityColor = getAuthorityColor(userData?.authorities);
    
    return (
      <div className="logged-in-state fade-in">
        <div className="user-info">
          <p>👋 Chào mừng trở lại!</p>
          <p>📝 Tài khoản: <strong>{userData?.account}</strong></p>
          <p>👤 Tên hiển thị: <strong>{userData?.username}</strong></p>
          <p>🎯 Quyền hạn: 
            <span style={{
              color: authorityColor,
              marginLeft: '0.5rem',
              fontWeight: 'bold'
            }}>
              {authorityName}
            </span>
          </p>
          {userData?.birthday && (
            <p>🎂 Ngày sinh: {new Date(userData.birthday).toLocaleDateString('vi-VN')}</p>
          )}
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            ⏰ Đăng nhập lúc: {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-btn"
          disabled={isLoading}
          aria-label="Đăng xuất khỏi tài khoản"
        >
          {isLoading ? 'Đang xử lý...' : '🚪 Đăng xuất'}
        </button>
      </div>
    );
  };

  return (
    <aside className="left-panel">
      <div className="login-container">
        <h3>{isLoggedIn ? '👤 Tài khoản của bạn' : '🔐 Đăng nhập'}</h3>
        
        {/* Hiển thị trạng thái tương ứng */}
        {isLoggedIn ? renderLoggedInState() : renderLoginForm()}
      </div>
      
      {/* Menu điều hướng */}
      <div className="left-menu">
        <h4>📋 Menu điều hướng</h4>
        <ul>
          <li><a href="/">🏠 Trang chủ</a></li>
          <li><a href="/profile">👤 Hồ sơ cá nhân</a></li>
          <li><a href="/settings">⚙️ Cài đặt tài khoản</a></li>
          {isLoggedIn && (
            <>
              <li><a href="/messages">✉️ Tin nhắn</a></li>
              <li><a href="/notifications">🔔 Thông báo</a></li>
              {AccountService.isAdmin() && (
                <li><a href="/admin">👑 Quản trị hệ thống</a></li>
              )}
              {AccountService.isModerator() && !AccountService.isAdmin() && (
                <li><a href="/moderator">🛡️ Quản lý nội dung</a></li>
              )}
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default LeftPanel;
//[file content end]