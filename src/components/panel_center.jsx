// panel_center.jsx
import React, { useState, useEffect } from 'react';
import '../css/panel_center.css';
import DialogAccountRegist from './dialogAccountRegist';
import DialogAccountDetails from './dialogAccountDetails';
import TelexVietnameseInput from './appTELEX';

const CenterPanel = () => {
  const [currentView, setCurrentView] = useState('default');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  // Thiết lập các hàm global
  useEffect(() => {
    // Hàm để hiển thị chi tiết tài khoản
    window.showAccountDetails = (userId) => {
      console.log('Opening account details for user ID:', userId);
      setSelectedUserId(userId);
      setShowAccountDetails(true);
      setCurrentView('account-details');
    };

    // Hàm để hiển thị đăng ký
    window.showRegisterDialog = () => {
      console.log('Opening register dialog');
      setCurrentView('register');
    };

    // Hàm để hiển thị phần mềm telex
    window.showAppTELEX =()=>{
      console.log('Show telex application');
      setCurrentView('appTELEX');
    }
    // Hàm reset về default
    window.resetToDefaultView = () => {
      console.log('Resetting to default view');
      setCurrentView('default');
      setShowAccountDetails(false);
      setSelectedUserId(null);
    };

    // Cleanup khi component unmount
    return () => {
      delete window.showAccountDetails;
      delete window.showRegisterDialog;
      delete window.showAppTELEX;
      delete window.resetToDefaultView;
    };
  }, []);

  // Hàm xử lý khi xóa tài khoản thành công
  const handleDeleteSuccess = (deletedUserId) => {
    console.log(`Account ${deletedUserId} deleted successfully`);
    setShowAccountDetails(false);
    setSelectedUserId(null);
    setCurrentView('default');
  };

  // Render nội dung theo currentView
  const renderContent = () => {
    switch (currentView) {
      case 'account-details':
        return (
          <DialogAccountDetails
            userId={selectedUserId}
            onBack={() => {
              setShowAccountDetails(false);
              setCurrentView('default');
            }}
            onDeleteSuccess={handleDeleteSuccess}
          />
        );
      
      case 'register':
        return (
          <DialogAccountRegist
            onBack={() => setCurrentView('default')}
          />
        );
      
      case 'appTELEX':
        return (
          <TelexVietnameseInput
          />
        )
      default:
        return (
          <div className="default-content">
            <h2>Welcome to the Application</h2>
            <p>This is the default view.</p>
            {/* Thêm nội dung mặc định của bạn ở đây */}
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