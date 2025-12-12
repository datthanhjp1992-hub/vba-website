//[file name]: panel_bottom.jsx
//[file content begin]
import React, { useState, useEffect } from 'react';
import ConnectionService from '../services/connection_service';
import {
    CONNECTION_TEST,
    CONNECTION_STATUS,
    CONNECTION_STATUS_COLORS,
    CONNECTION_STATUS_MESSAGES,
    SERVER_CONFIG
} from '../services/constants';
import '../css/panel_bottom.css';

const BottomPanel = () => {
  const currentYear = new Date().getFullYear();
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.CHECKING);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [checkController, setCheckController] = useState(null);

  // Hàm kiểm tra kết nối
  const checkConnection = async () => {
    try {
      setConnectionStatus(CONNECTION_STATUS.CHECKING);
      
      const result = await ConnectionService.comprehensiveCheck();
      
      setLastCheckTime(new Date().toISOString());
      setConnectionDetails(result);
      
      if (result.connected) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      } else {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    } catch (error) {
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastCheckTime(new Date().toISOString());
      console.error('Connection check failed:', error);
    }
  };

  // Hàm kiểm tra nhanh khi click
  const handleQuickCheck = async () => {
    await checkConnection();
  };

  // Khởi động kiểm tra định kỳ
  useEffect(() => {
    // Kiểm tra ngay lần đầu
    checkConnection();
    
    // Bắt đầu kiểm tra định kỳ
    const controller = ConnectionService.startPeriodicCheck((result) => {
      setConnectionDetails(result);
      setLastCheckTime(new Date().toISOString());
      
      if (result.connected) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      } else {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    }, CONNECTION_TEST.INTERVAL);
    
    setCheckController(controller);
    
    // Cleanup khi component unmount
    return () => {
      if (controller) {
        controller.stop();
      }
    };
  }, []);

  // Định dạng thời gian
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Chưa kiểm tra';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Lấy thông điệp dựa trên trạng thái
  const getStatusMessage = () => {
    if (connectionDetails?.basicTest?.message) {
      return connectionDetails.basicTest.message;
    }
    return CONNECTION_STATUS_MESSAGES[connectionStatus];
  };

  return (
    <footer className="bottom-panel">
      <div className="container">
        {/* Connection Status Bar */}
        <div className="connection-status-bar">
          <div className="status-info">
            <div className="status-indicator">
              <div 
                className="status-dot" 
                style={{ backgroundColor: CONNECTION_STATUS_COLORS[connectionStatus] }}
              ></div>
              <span className="status-text">
                {CONNECTION_STATUS_MESSAGES[connectionStatus]}
              </span>
            </div>
            
            <div className="status-details">
              <span className="status-message">{getStatusMessage()}</span>
              <span className="check-time">
                Lần cuối: {formatTime(lastCheckTime)}
              </span>
            </div>
          </div>
          
          <div className="status-actions">
            <button 
              className="btn-check-connection"
              onClick={handleQuickCheck}
              disabled={connectionStatus === CONNECTION_STATUS.CHECKING}
            >
              {connectionStatus === CONNECTION_STATUS.CHECKING ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
            </button>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="footer-content">
          <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <p>Email: contact@example.com</p>
            <p>Điện thoại: (0123) 456-789</p>
            <p>Địa chỉ: 123 Đường ABC, TP.HCM</p>
          </div>
          
          <div className="quick-links">
            <h3>Liên kết nhanh</h3>
            <a href="/privacy">Chính sách bảo mật</a>
            <a href="/terms">Điều khoản sử dụng</a>
            <a href="/faq">FAQ</a>
          </div>
          
          <div className="social-media">
            <h3>Mạng xã hội</h3>
            <div className="social-icons">
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="copyright">
          <p>© {currentYear} My Website. Tất cả quyền được bảo lưu.</p>
          <p className="app-version">
            Server: {SERVER_CONFIG?.BASE_URL || 'Unknown'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BottomPanel;
//[file content end]