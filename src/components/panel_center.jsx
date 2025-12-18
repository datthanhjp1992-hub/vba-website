//[FileName]: panel_center.jsx
//[Version]: 1.0
//[Content]: Đây là components chính phụ trách việc hiển thị thông tin của các components con
/**
 * v1.0: Default
 * v1.1: Bấm nút quay lại trên dialogAccountChange thì sẽ trở về dialogAccountDetails
 */

import React, { useState, useEffect } from 'react';
import '../css/panel_center.css';
import DialogAccountRegist from './dialogAccountRegist';
import DialogAccountDetails from './dialogAccountDetails';
import DialogAccountChange from './dialogAccountChange'; // Thêm import mới
import TelexVietnameseInput from './appTELEX';
import PageContactInformation from './pageContactInformation';

const CenterPanel = () => {
  const [currentView, setCurrentView] = useState('default');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showAccountChange, setShowAccountChange] = useState(false); // State mới

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
    };

    // Hàm để hiển thị phần mềm telex
    window.showPageContactInformation =()=>{
      console.log('Show Page Contact Information');
      setCurrentView('pageContactInformation');
    };

    // Hàm để hiển thị thay đổi tài khoản
    window.showAccountChangeDialog = (userId) => {
      console.log('Opening account change dialog for user ID:', userId);
      setSelectedUserId(userId);
      setShowAccountChange(true);
      setCurrentView('account-change');
    };

    // Hàm reset về default
    window.resetToDefaultView = () => {
      console.log('Resetting to default view');
      setCurrentView('default');
      setShowAccountDetails(false);
      setShowAccountChange(false);
      setSelectedUserId(null);
    };

    // Cleanup khi component unmount
    return () => {
      delete window.showAccountDetails;
      delete window.showRegisterDialog;
      delete window.showAppTELEX;
      delete window.showAccountChangeDialog;
      delete window.resetToDefaultView;
      delete window.showPageContactInformation;
    };
  }, []);

  // Hàm xử lý khi xóa tài khoản thành công
  const handleDeleteSuccess = (deletedUserId) => {
    console.log(`Account ${deletedUserId} deleted successfully`);
    setShowAccountDetails(false);
    setSelectedUserId(null);
    setCurrentView('default');
  };

  // Hàm xử lý khi thay đổi tài khoản thành công
  const handleAccountChangeSuccess = (updatedUserId) => {
    console.log(`Account ${updatedUserId} updated successfully`);
    setShowAccountChange(false);
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
          <TelexVietnameseInput />
        );

      case 'account-change':
        return (
          <DialogAccountChange
            userId={selectedUserId}
            onBack={() => {
              setShowAccountChange(false);
              setCurrentView('account-details');
            }}
            onChangeSuccess={handleAccountChangeSuccess}
          />
        );
      case 'pageContactInformation':
        return (
          <PageContactInformation />
        );
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