// dialogAccountDetails.jsx
import React, { useState, useEffect } from 'react';
import '../css/dialogAccountDetails.css';
import AccountService from '../services/account_service';

const DialogAccountDetails = ({ userId, onBack }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const data = await AccountService.getUserDetails(userId);
      setUserData(data);
    } catch (err) {
      setError('Không thể tải thông tin người dùng');
      console.error('Error fetching user details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dialog-account-details loading">
        <div className="spinner">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dialog-account-details error">
        <p>{error}</p>
        <button onClick={onBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="dialog-account-details">
      <div className="details-header">
        <h2>👤 Thông tin chi tiết tài khoản</h2>
        <button className="back-btn" onClick={onBack}>
          ← Quay lại
        </button>
      </div>

      <div className="user-details-card">
        <div className="detail-row">
          <span className="label">Tài khoản:</span>
          <span className="value">{userData.account}</span>
        </div>
        <div className="detail-row">
          <span className="label">Tên hiển thị:</span>
          <span className="value">{userData.username}</span>
        </div>
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{userData.email || 'Chưa cập nhật'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Ngày sinh:</span>
          <span className="value">
            {userData.birthday 
              ? new Date(userData.birthday).toLocaleDateString('vi-VN')
              : 'Chưa cập nhật'}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Ngày tạo tài khoản:</span>
          <span className="value">
            {new Date(userData.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Quyền hạn:</span>
          <span className="value authority">
            {AccountService.getAuthorityName(userData.authorities)}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Trạng thái:</span>
          <span className={`value status ${userData.status}`}>
            {userData.status === 'active' ? '✅ Hoạt động' : '❌ Bị khóa'}
          </span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="edit-btn" onClick={() => console.log('Edit clicked')}>
          ✏️ Chỉnh sửa thông tin
        </button>
        <button className="change-password-btn" onClick={() => console.log('Change password clicked')}>
          🔒 Đổi mật khẩu
        </button>
      </div>
    </div>
  );
};

export default DialogAccountDetails;