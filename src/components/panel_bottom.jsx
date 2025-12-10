import React from 'react';
import '../../css/panel_bottom.css';

const BottomPanel = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bottom-panel">
      <div className="container">
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
        </div>
      </div>
    </footer>
  );
};

export default BottomPanel;