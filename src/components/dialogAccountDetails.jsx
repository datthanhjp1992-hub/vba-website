//[FileName]: dialogAccountDetails.jsx
//[Version]: 1.0
//[Content]: Đây là component phụ trách công việc hiển thị thông tin người dùng

import React, { useState, useEffect } from 'react';
import '../css/dialogAccountDetails.css';
import AccountService from '../services/account_service';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const DialogAccountDetails = ({ userId, onBack, onDeleteSuccess }) => {
  const { logout, currentUser: authUser } = useAuth(); // Lấy logout từ context
  
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching user details for ID:', userId);
      const result = await AccountService.getAccountDetail(userId);
      console.log('API Response:', result);
      
      if (result.success) {
        setUserData(result.data);
      } else {
        setError(result.message || 'Không thể tải thông tin người dùng');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Lỗi kết nối server. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      setDeleteMessage({
        type: 'error',
        text: 'Không tìm thấy ID tài khoản'
      });
      return;
    }

    setIsDeleting(true);
    setDeleteMessage({ type: '', text: '' });

    try {
      const result = await AccountService.deleteAccount(userId);
      
      if (result.success) {
        setDeleteMessage({
          type: 'success',
          text: '✅ Đã xóa tài khoản thành công!'
        });
        
        // Đăng xuất nếu đang xóa tài khoản của chính mình
        if (authUser && authUser.index === userId) {
          logout(); // Sử dụng context logout
        }

        // Hiển thị thông báo thành công trong 2 giây
        setTimeout(() => {
          setShowDeleteConfirm(false);
          if (onDeleteSuccess) {
            onDeleteSuccess(userId);
          }
          if (onBack) {
            onBack();
          }
        }, 2000);
      } else {
        setDeleteMessage({
          type: 'error',
          text: `❌ ${result.message || 'Không thể xóa tài khoản'}`
        });
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteMessage({
        type: 'error',
        text: '❌ Lỗi kết nối server. Vui lòng thử lại sau.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
    setDeleteMessage({ type: '', text: '' });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteMessage({ type: '', text: '' });
  };

  // Hàm xử lý khi bấm nút chỉnh sửa
  const handleEditClick = () => {
    if (userId && window.showAccountChangeDialog) {
      // Gọi hàm global để mở dialog thay đổi tài khoản
      window.showAccountChangeDialog(userId);
    } else {
      console.error('Không thể mở dialog chỉnh sửa. UserId:', userId);
    }
  };

  // Hàm tính tuổi dựa vào năm sinh
  const calculateAge = (birthday) => {
    if (!birthday) return 'Chưa cập nhật';
    try {
      const birthDate = new Date(birthday);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // Điều chỉnh nếu chưa đến sinh nhật trong năm nay
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
    
      return `${age} tuổi`;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'Không xác định';
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
        {/*}
        <div className="header-actions">
          <button className="back-btn" onClick={onBack}>
            ← Quay lại
          </button>
        </div>
        */}
      </div>

      {/* Thông báo xóa */}
      {deleteMessage.text && (
        <div className={`delete-message ${deleteMessage.type}`}>
          {deleteMessage.text}
        </div>
      )}

      <div className="user-details-card">
        {/* Tên tài khoản */}
        <div className="detail-row">
          <span className="label">Tài khoản:</span>
          <span className="value">{userData.account}</span>
        </div>
        
        {/* Tên hiển thị */}
        <div className="detail-row">
          <span className="label">Tên hiển thị:</span>
          <span className="value">{userData.username}</span>
        </div>
        
        {/* Tuổi */}
        <div className="detail-row">
          <span className="label">Tuổi:</span>
          <span className="value">
            {userData.birthday 
              ? `${calculateAge(userData.birthday)}`
              : 'Chưa cập nhật'}
          </span>
        </div>
        
        {/* Email */}
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{userData.email || 'Chưa cập nhật'}</span>
        </div>
        
        {/* Số điện thoại */}
        <div className="detail-row">
          <span className="label">Số điện thoại:</span>
          <span className="value">{userData.tel || 'Chưa cập nhật'}</span>
        </div>
        
        {/* Ngày đăng ký */}
        <div className="detail-row">
          <span className="label">Ngày đăng ký:</span>
          <span className="value">
            {userData.registdate 
              ? new Date(userData.registdate).toLocaleDateString('vi-VN')
              : 'Chưa cập nhật'}
          </span>
        </div>
        
        {/* Quyền hạn */}
        <div className="detail-row">
          <span className="label">Quyền hạn:</span>
          <span className="value authority-badge">
            {userData.authorities === 0 && '👤 Người dùng'}
            {userData.authorities === 1 && '👑 Admin'}
            {userData.authorities === 2 && '🛡️ Moderator'}
            {userData.authorities > 2 && `Quyền #${userData.authorities}`}
          </span>
        </div>
      </div>

      <div className="action-buttons">
        {/* Nút chỉnh sửa thông tin */}
        <button className="edit-btn" onClick={handleEditClick}>
          ✏️ Chỉnh sửa thông tin
        </button>
                
        {/* Nút xóa tài khoản */}
        <button 
          className="delete-btn"
          onClick={confirmDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '⏳ Đang xóa...' : '🗑️ Xóa tài khoản'}
        </button>
      </div>

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h3>⚠️ Xác nhận xóa tài khoản</h3>
            <p>Bạn có chắc chắn muốn xóa tài khoản <strong>{userData.account}</strong>?</p>
            <p className="warning-text">
              Hành động này <strong>KHÔNG THỂ</strong> hoàn tác. Tất cả dữ liệu của người dùng sẽ bị xóa vĩnh viễn.
            </p>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialogAccountDetails;