import React, { useState } from 'react';
import '../css/panel_center.css';
import DialogAccountRegist from './dialogAccountRegist';

const CenterPanel = () => {
  const [currentView, setCurrentView] = useState('default');

  // Expose function for left panel to call
  React.useEffect(() => {
    window.showRegisterDialog = () => {
      setCurrentView('register');
    };
    
    return () => {
      delete window.showRegisterDialog;
    };
  }, []);

  const handleBackFromRegister = () => {
    setCurrentView('default');
  };

  return (
    <div className="center-panel">
      {currentView === 'register' ? (
        <DialogAccountRegist onBack={handleBackFromRegister} />
      ) : (
        <div className="default-content">
          <h1>Chào mừng đến với ứng dụng</h1>
          <p>Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu.</p>
        </div>
      )}
    </div>
  );
};

export default CenterPanel;