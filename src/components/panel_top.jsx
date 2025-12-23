import React, { useState } from 'react';
import '../css/panel_top.css';

const TopPanel = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleShowHomePage = () => {
    window.resetToDefaultView();
    setIsMenuOpen(false);
  };

  const handleShowContactInformation = () => {
    window.showPageContactInformation();
    setIsMenuOpen(false);
  };

  const handleShowVBAFunctionView =()=>{
    window.showPageVBAFunctionView();
    setIsMenuOpen(false);
  }
  return (
    <header className="top-panel">
      <div className="container">
        <div className="logo-section">
          <h1 className="logo">
            <span className="logo-vba">VBA</span>
            <span className="logo-er">-er</span>
          </h1>
          <p className="tagline">Chia sẻ kiến thức VBA miễn phí</p>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-navigation">
          <button className="nav-button" onClick={handleShowHomePage}>
            <span className="nav-icon">🏠</span>
            Trang chủ
          </button>
          <button className="nav-button" onClick={handleShowContactInformation}>
            <span className="nav-icon">👤</span>
            Giới thiệu
          </button>
          <button className="nav-button" onClick={handleShowVBAFunctionView}>
            <span className="nav-icon">🔧</span>
            Dịch vụ
          </button>
          <button className="cta-button">
            Đăng ký học
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-navigation ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-nav-content">
            <button className="mobile-nav-item" onClick={handleShowHomePage}>
              <span className="mobile-nav-icon">🏠</span>
              Trang chủ
            </button>
            <button className="mobile-nav-item" onClick={handleShowContactInformation}>
              <span className="mobile-nav-icon">👤</span>
              Giới thiệu
            </button>
            <button className="mobile-nav-item">
              <span className="mobile-nav-icon">🔧</span>
              Code tham khảo
            </button>
            <button className="mobile-cta">
              Đăng ký học ngay
            </button>
          </div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="header-accent"></div>
    </header>
  );
};

export default TopPanel;