import React from 'react';
import '../../css/panel_top.css';

const TopPanel = () => {
  return (
    <header className="top-panel">
      <div className="container">
        <h1 className="logo">My Website</h1>
        <nav className="navigation">
          <a href="/">Trang chủ</a>
          <a href="/about">Giới thiệu</a>
          <a href="/services">Dịch vụ</a>
          <a href="/contact">Liên hệ</a>
        </nav>
      </div>
    </header>
  );
};

export default TopPanel;