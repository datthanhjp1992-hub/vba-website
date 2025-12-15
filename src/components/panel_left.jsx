import React, { useState, useEffect } from 'react';
import '../css/panel_left.css';
import AccountService from '../services/account_service';
import DialogAccountRegist from './dialogAccountRegist';
import { useAuth } from '../context/AuthContext';
import { 
    VALIDATION_RULES,
    ERROR_MESSAGES,
    getAuthorityName,
    getAuthorityColor,
    validateAccount,
    validatePassword
} from '../services/constants';

const LeftPanel = () => {
  const { 
    isAuthenticated, 
    currentUser, 
    login, 
    logout, 
    isLoading: authLoading 
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    account: '',
    password: '',
  });
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [currentView, setCurrentView] = useState('default');

  // Chuyển về trang default
  const handleBackToHome = () => {
    if (window.resetToDefaultView) {
      window.resetToDefaultView();
    }
  }

  // Chuyển về trang Account Details - SỬA LẠI Ở ĐÂY
  const handleBackToAccountDetails = (e) => {
    e.preventDefault();
    if (window.showAccountDetails && currentUser?.index) {
      // Sử dụng currentUser từ AuthContext thay vì userData cũ
      window.showAccountDetails(currentUser.index);
    } else {
      console.error('Không thể mở hồ sơ cá nhân:', {
        hasFunction: !!window.showAccountDetails,
        currentUser: currentUser,
        userIndex: currentUser?.index
      });
    }
  }

  // Xử lý đăng nhập với API
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await AccountService.login(formData.account, formData.password);
      
      if (result.success) {
        login(result.data); // Sử dụng context login
        
        setFormData({ account: '', password: '' });
        console.log('Đăng nhập thành công:', result.data);
        
        // Mở luôn hồ sơ cá nhân sau khi đăng nhập
        if (window.showAccountDetails && result.data.index) {
          // Thêm setTimeout để đảm bảo UI đã cập nhật
          setTimeout(() => {
            window.showAccountDetails(result.data.index);
          }, 100);
        }
      } else {
        setErrorMessage(result.message || ERROR_MESSAGES.LOGIN_FAILED);
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
    logout(); // Sử dụng context logout
    
    if (window.resetToDefaultView) {
      window.resetToDefaultView();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Xử lý mở dialog đăng ký
  const handleOpenRegisterDialog = (e) => {
    e.preventDefault();
    setShowRegisterDialog(true);
  };

  // Xử lý đóng dialog đăng ký
  const handleCloseRegisterDialog = (e) => {
    e.preventDefault();
    setShowRegisterDialog(false);
  };

  // Xử lý khi đăng ký thành công
  const handleRegisterSuccess = (userData) => {
    console.log('Đăng ký thành công:', userData);
    setTimeout(() => {
      setShowRegisterDialog(false);
    }, 2000);
  };

  // Render form đăng nhập
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="login-form-state fade-in">
      {errorMessage && (
        <div className="error-message">
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
        <small>Chỉ được dùng chữ cái, số và dấu gạch dưới</small>
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
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (window.showRegisterDialog) {
              window.showRegisterDialog();
            }
          }}
        >
          Đăng ký tài khoản
        </a>
      </div>
    </form>
  );

  // Render thông tin đã đăng nhập
  const renderLoggedInState = () => {
    const authorityName = getAuthorityName(currentUser?.authorities);
    const authorityColor = getAuthorityColor(currentUser?.authorities);
    
    return (
      <div className="logged-in-state fade-in">
        <div className="user-info">
          <p>👋 Chào mừng trở lại!</p>
          <p>📌 Tài khoản: <strong>{currentUser?.account}</strong></p>
          <p>👤 Tên hiển thị: <strong>{currentUser?.username}</strong></p>
          {/* Hiển thị thông tin khác nếu cần */}
        </div>
        <button 
          onClick={handleLogout}
          className="logout-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : '🚪 Đăng xuất'}
        </button>
      </div>
    );
  };

  return (
    <aside className="left-panel">
      <div className="login-container">
        <h3>{isAuthenticated ? '👤 Tài khoản của bạn' : '🔐 Đăng nhập'}</h3>
        
        {isAuthenticated ? renderLoggedInState() : renderLoginForm()}
      </div>
      
      {/* Menu điều hướng */}
      {isAuthenticated && (
        <div className="left-menu">
          <h4>📋 Menu điều hướng</h4>
          <ul>
            <li><a href="#" onClick={handleBackToHome}>🏠 Trang chủ</a></li>
            <li>
              <a href="#" onClick={handleBackToAccountDetails}>
                👤 Hồ sơ cá nhân
                {currentUser?.index && (
                  <span style={{fontSize: '0.8em', marginLeft: '5px', color: '#666'}}>
                    (ID: {currentUser.index})
                  </span>
                )}
              </a>
            </li>
            <li><a href="/settings">⚙️ Cài đặt tài khoản</a></li>
            <li><a href="/messages">✉️ Tin nhắn</a></li>
            <li><a href="/notifications">🔔 Thông báo</a></li>
            
            {AccountService.isAdmin() && (
              <li><a href="/admin">👑 Quản trị hệ thống</a></li>
            )}
            
            {AccountService.isModerator() && !AccountService.isAdmin() && (
              <li><a href="/moderator">🛡️ Quản lý nội dung</a></li>
            )}
          </ul>
        </div>
      )}
      
      {/* Dialog đăng ký */}
      {showRegisterDialog && (
        <DialogAccountRegist
          onClose={handleCloseRegisterDialog}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </aside>
  );
};

export default LeftPanel;