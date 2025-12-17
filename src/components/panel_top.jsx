import React from 'react';
import '../css/panel_top.css';

const TopPanel = () => {

  // return 
  const handleShowHomePage = () =>{
    window.resetToDefaultView();
  }

  return (
    <header className="top-panel">
      <div className="container">
        <h1 className="logo">VBA-er </h1>
        <h1>Trang web chia sẻ kiến thức miễn phí về VBA</h1>
        <nav className="navigation">
          <a href="#" onClick={handleShowHomePage}>Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Dịch vụ</a>
          <a href="#">Liên hệ</a>
        </nav>
      </div>
    </header>
  );
};

export default TopPanel;