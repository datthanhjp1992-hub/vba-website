// panel_center.jsx
import React, { useState, useEffect } from 'react';
import '../css/panel_center.css';
import DialogAccountRegist from './dialogAccountRegist';
import DialogAccountDetails from './dialogAccountDetails';

const CenterPanel = () => {
  const [currentView, setCurrentView] = useState('default');
  const [viewData, setViewData] = useState({});

  // Expose functions for other components to call
  useEffect(() => {
    window.showRegisterDialog = () => {
      setCurrentView('register');
      setViewData({});
    };
    
    window.showAccountDetails = (userId) => {
      setCurrentView('accountDetails');
      setViewData({ userId });
    };
    
    return () => {
      delete window.showRegisterDialog;
      delete window.showAccountDetails;
    };
  }, []);

  const handleBack = () => {
    setCurrentView('default');
    setViewData({});
  };

  const renderContent = () => {
    switch (currentView) {
      case 'register':
        return <DialogAccountRegist onBack={handleBack} />;
      
      case 'accountDetails':
        return <DialogAccountDetails 
          userId={viewData.userId} 
          onBack={handleBack} 
        />;
      
      default:
        return (
          <div className="default-content">
            <h1>Chào mừng đến với ứng dụng</h1>
            <p>Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu.</p>
          </div>
        );
    }
  };

  return (
    <div className="center-panel">
      {renderContent()}
    </div>
  );
};

export default CenterPanel;