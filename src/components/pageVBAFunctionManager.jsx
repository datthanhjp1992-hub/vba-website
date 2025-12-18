//[file name]: pageVBAFunctionManager.jsx
//[Version] 2.0: Sử dụng services và constants có sẵn để giảm thiểu code

import React, { useState, useEffect } from 'react';
import AccountService from '../services/account_service';
import ConnectionService from '../services/connection_service';
import {
    SERVER_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    getApiUrl,
    validateAccount,
    validatePassword,
    validateEmail
} from '../services/constants';
import '../css/pageVBAFunctionManager.css';

const PageVBAFunctionManager = () => {
    const [functions, setFunctions] = useState([]);
    const [selectedFunction, setSelectedFunction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State cho dialog và form
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        comment: '',
        type: '4'
    });
    
    // State cho thông báo
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    
    // State cho tìm kiếm và filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showDeleted, setShowDeleted] = useState(false);
    
    // Load current user và functions
    useEffect(() => {
        loadUserAndFunctions();
    }, [showDeleted]);
    
    // Tải user hiện tại và functions
    const loadUserAndFunctions = async () => {
        try {
            // Lấy user từ AccountService
            const user = AccountService.getCurrentUser();
            setCurrentUser(user);
            
            if (user) {
                await loadFunctions();
            } else {
                setLoading(false);
                showNotification('Vui lòng đăng nhập để quản lý functions', 'warning');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            setLoading(false);
        }
    };
    
    // Load functions từ API
    const loadFunctions = async () => {
        try {
            setLoading(true);
            const user = AccountService.getCurrentUser();
            
            if (!user || !user.index) {
                showNotification('Vui lòng đăng nhập để quản lý functions', 'warning');
                setLoading(false);
                return;
            }
            
            // Kiểm tra kết nối trước khi load
            const connection = await ConnectionService.quickCheck();
            if (!connection.connected) {
                showNotification('Mất kết nối đến server', 'error');
                setLoading(false);
                return;
            }
            
            // Xây dựng URL với API endpoint
            const baseUrl = SERVER_CONFIG.BASE_URL;
            const params = new URLSearchParams();
            if (showDeleted) params.append('show_deleted', 'true');
            
            const url = `${baseUrl}api/vba-functions${params.toString() ? '?' + params.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Filter chỉ lấy functions của user hiện tại (trừ admin)
                let userFunctions = data.data || [];
                const isAdmin = AccountService.isAdmin();
                
                if (!isAdmin) {
                    userFunctions = userFunctions.filter(func => 
                        func.creater === user.index.toString()
                    );
                }
                
                setFunctions(userFunctions);
                
                if (userFunctions.length > 0 && !selectedFunction) {
                    setSelectedFunction(userFunctions[0]);
                }
            } else {
                throw new Error(data.error || ERROR_MESSAGES.SERVER_ERROR);
            }
        } catch (error) {
            console.error('Error loading functions:', error);
            showNotification(`Lỗi khi tải functions: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // Hiển thị thông báo
    const showNotification = (message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });
        
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };
    
    // Xử lý chọn function
    const handleSelectFunction = (func) => {
        setSelectedFunction(func);
    };
    
    // Xử lý mở dialog thêm mới
    const handleAddFunction = () => {
        if (!AccountService.isLoggedIn()) {
            showNotification('Vui lòng đăng nhập để thêm function mới', 'warning');
            return;
        }
        
        setFormData({
            title: '',
            content: '',
            comment: '',
            type: '4'
        });
        setDialogMode('add');
        setShowDialog(true);
    };
    
    // Xử lý mở dialog chỉnh sửa
    const handleEditFunction = () => {
        if (!selectedFunction) {
            showNotification('Vui lòng chọn function để chỉnh sửa', 'warning');
            return;
        }
        
        // Kiểm tra quyền chỉnh sửa
        const isAdmin = AccountService.isAdmin();
        if (selectedFunction.creater !== AccountService.getUserId()?.toString() && !isAdmin) {
            showNotification('Bạn không có quyền chỉnh sửa function này', 'error');
            return;
        }
        
        setFormData({
            title: selectedFunction.title || '',
            content: selectedFunction.content || '',
            comment: selectedFunction.comment || '',
            type: selectedFunction.type?.toString() || '4'
        });
        setDialogMode('edit');
        setShowDialog(true);
    };
    
    // Xử lý xóa function
    const handleDeleteFunction = async () => {
        if (!selectedFunction) {
            showNotification('Vui lòng chọn function để xóa', 'warning');
            return;
        }
        
        // Kiểm tra quyền xóa
        const isAdmin = AccountService.isAdmin();
        if (selectedFunction.creater !== AccountService.getUserId()?.toString() && !isAdmin) {
            showNotification('Bạn không có quyền xóa function này', 'error');
            return;
        }
        
        if (!window.confirm(`Bạn có chắc chắn muốn xóa function "${selectedFunction.title}"?`)) {
            return;
        }
        
        try {
            const baseUrl = SERVER_CONFIG.BASE_URL;
            let url, method, result;
            
            if (selectedFunction.delete_flag) {
                // Xóa cứng
                url = `${baseUrl}api/vba-functions/${selectedFunction.id}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                result = await response.json();
            } else {
                // Xóa mềm
                url = `${baseUrl}api/vba-functions/${selectedFunction.id}/soft-delete`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                result = await response.json();
            }
            
            if (result.success) {
                showNotification(result.message || SUCCESS_MESSAGES.DELETE_SUCCESS, 'success');
                loadFunctions();
                
                // Xóa selectedFunction nếu nó đã bị xóa
                if (selectedFunction.id === result.data?.id) {
                    setSelectedFunction(null);
                }
            } else {
                throw new Error(result.error || ERROR_MESSAGES.DELETE_ERROR);
            }
        } catch (error) {
            console.error('Error deleting function:', error);
            showNotification(`Lỗi khi xóa function: ${error.message}`, 'error');
        }
    };
    
    // Xử lý khôi phục function
    const handleRestoreFunction = async () => {
        if (!selectedFunction || !selectedFunction.delete_flag) {
            return;
        }
        
        try {
            const baseUrl = SERVER_CONFIG.BASE_URL;
            const url = `${baseUrl}api/vba-functions/${selectedFunction.id}/restore`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message || 'Đã khôi phục function thành công', 'success');
                loadFunctions();
            } else {
                throw new Error(result.error || 'Không thể khôi phục function');
            }
        } catch (error) {
            console.error('Error restoring function:', error);
            showNotification(`Lỗi khi khôi phục function: ${error.message}`, 'error');
        }
    };
    
    // Xử lý lưu form
    const handleSaveForm = async () => {
        // Validate
        if (!formData.content.trim()) {
            showNotification('Nội dung function là bắt buộc', 'error');
            return;
        }
        
        if (formData.title.length > 50) {
            showNotification('Tiêu đề không được vượt quá 50 ký tự', 'error');
            return;
        }
        
        try {
            const baseUrl = SERVER_CONFIG.BASE_URL;
            const user = AccountService.getCurrentUser();
            let url, method, bodyData;
            
            if (dialogMode === 'add') {
                // Thêm mới
                url = `${baseUrl}api/vba-functions`;
                method = 'POST';
                bodyData = {
                    title: formData.title || 'Untitled Function',
                    content: formData.content,
                    comment: formData.comment || '',
                    type: parseInt(formData.type) || 4,
                    creater: user?.index?.toString()
                };
            } else {
                // Chỉnh sửa
                url = `${baseUrl}api/vba-functions/${selectedFunction.id}`;
                method = 'PUT';
                bodyData = {
                    title: formData.title || 'Untitled Function',
                    content: formData.content,
                    comment: formData.comment || '',
                    type: parseInt(formData.type) || 4
                };
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(
                    dialogMode === 'add' ? SUCCESS_MESSAGES.REGISTER_SUCCESS : SUCCESS_MESSAGES.UPDATE_SUCCESS,
                    'success'
                );
                setShowDialog(false);
                loadFunctions();
                
                // Select function mới tạo/chỉnh sửa
                if (result.data) {
                    setSelectedFunction(result.data);
                }
            } else {
                throw new Error(result.error || ERROR_MESSAGES.UPDATE_ERROR);
            }
        } catch (error) {
            console.error('Error saving function:', error);
            showNotification(`Lỗi khi lưu function: ${error.message}`, 'error');
        }
    };
    
    // Filter functions
    const filteredFunctions = functions.filter(func => {
        // Filter theo type
        if (filterType !== 'all' && func.type !== parseInt(filterType)) {
            return false;
        }
        
        // Filter theo search term
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            return (
                (func.title && func.title.toLowerCase().includes(term)) ||
                (func.content && func.content.toLowerCase().includes(term)) ||
                (func.comment && func.comment.toLowerCase().includes(term)) ||
                (func.display_id && func.display_id.toLowerCase().includes(term)) ||
                (func.type_name && func.type_name.toLowerCase().includes(term))
            );
        }
        
        return true;
    });
    
    // Lấy màu cho loại function
    const getTypeColor = (type) => {
        const colorMap = {
            1: '#217346', // Excel green
            2: '#A4373A', // Access red
            3: '#D24726', // PowerPoint orange
            4: '#6C757D'  // Other gray
        };
        return colorMap[type] || '#6C757D';
    };
    
    // Lấy tên loại function
    const getTypeName = (type) => {
        const nameMap = {
            1: 'EXCEL',
            2: 'ACCESS',
            3: 'POWERPOINT',
            4: 'OTHER'
        };
        return nameMap[type] || 'OTHER';
    };
    
    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = AccountService.isLoggedIn();
    const isAdmin = AccountService.isAdmin();

    return (
        <div className="vba-function-manager">
            {/* Header */}
            <div className="manager-header">
                <h2>Quản lý VBA Functions</h2>
                <div className="header-actions">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleAddFunction}
                        disabled={!isLoggedIn}
                    >
                        <span className="btn-icon">+</span> Thêm mới
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={loadFunctions}
                    >
                        <span className="btn-icon">↻</span> Làm mới
                    </button>
                </div>
            </div>
            
            {/* Notification */}
            {notification.show && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            
            {/* Main Content - Split 3/7 */}
            <div className="manager-content">
                {/* Left Panel - 30% */}
                <div className="VBAFunctionManager-left-panel">
                    <div className="panel-header">
                        <h3>Danh sách Functions ({filteredFunctions.length})</h3>
                        
                        {/* Search and Filters */}
                        <div className="filter-controls">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                            
                            <div className="filter-group">
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="1">Excel</option>
                                    <option value="2">Access</option>
                                    <option value="3">PowerPoint</option>
                                    <option value="4">Other</option>
                                </select>
                                
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={showDeleted}
                                        onChange={(e) => setShowDeleted(e.target.checked)}
                                    />
                                    Hiển thị đã xóa
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Functions List */}
                    <div className="functions-list">
                        {loading ? (
                            <div className="loading">Đang tải...</div>
                        ) : filteredFunctions.length === 0 ? (
                            <div className="empty-message">
                                {searchTerm ? 'Không tìm thấy function nào' : 'Chưa có function nào'}
                                {!isLoggedIn && <div><br/>Vui lòng đăng nhập để xem functions của bạn</div>}
                            </div>
                        ) : (
                            <div className="function-items">
                                {filteredFunctions.map(func => (
                                    <div 
                                        key={func.id}
                                        className={`function-item ${selectedFunction?.id === func.id ? 'selected' : ''} ${func.delete_flag ? 'deleted' : ''}`}
                                        onClick={() => handleSelectFunction(func)}
                                    >
                                        <div className="function-item-header">
                                            <span 
                                                className="function-id"
                                                style={{ backgroundColor: getTypeColor(func.type) }}
                                            >
                                                {func.display_id || `ID: ${func.id}`}
                                            </span>
                                            {func.delete_flag && (
                                                <span className="deleted-badge">Đã xóa</span>
                                            )}
                                        </div>
                                        <div className="function-title">
                                            {func.title || 'Untitled Function'}
                                        </div>
                                        <div className="function-meta">
                                            <span className="function-type">
                                                {getTypeName(func.type)}
                                            </span>
                                            <span className="function-date">
                                                {formatDate(func.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Right Panel - 70% */}
                <div className="vbaFunctionManager-right-panel">
                    {selectedFunction ? (
                        <div className="function-detail">
                            <div className="detail-header">
                                <h3>Chi tiết Function</h3>
                                <div className="detail-actions">

                                    <button 
                                        className="btn btn-edit" 
                                        onClick={handleEditFunction}
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>

                                    {selectedFunction.delete_flag ? (
                                        <button 
                                            className="btn btn-restore" 
                                            onClick={handleRestoreFunction}
                                            disabled={!isAdmin && selectedFunction.creater !== AccountService.getUserId()?.toString()}
                                        >
                                            ↩️ Khôi phục
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-delete" 
                                            onClick={handleDeleteFunction}
                                            disabled={!isAdmin && selectedFunction.creater !== AccountService.getUserId()?.toString()}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="detail-content">
                                {/* Basic Info */}
                                <div className="info-section">
                                    <h4>Thông tin cơ bản</h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Display ID:</label>
                                            <span 
                                                className="display-id"
                                                style={{ backgroundColor: getTypeColor(selectedFunction.type) }}
                                            >
                                                {selectedFunction.display_id || `ID: ${selectedFunction.id}`}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <label>Database ID:</label>
                                            <span>{selectedFunction.id}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Tiêu đề:</label>
                                            <span>{selectedFunction.title || 'Untitled Function'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Loại:</label>
                                            <span 
                                                className="type-badge"
                                                style={{ 
                                                    backgroundColor: getTypeColor(selectedFunction.type),
                                                    color: 'white'
                                                }}
                                            >
                                                {getTypeName(selectedFunction.type)}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <label>Người tạo:</label>
                                            {/* <span>{selectedFunction.creater || 'Unknown'}</span> */}
                                            <span>{currentUser.username || 'Unknown'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Trạng thái:</label>
                                            <span className={selectedFunction.delete_flag ? 'status-deleted' : 'status-active'}>
                                                {selectedFunction.delete_flag ? 'Đã xóa' : 'Đang hoạt động'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Stats */}
                                <div className="info-section">
                                    <h4>Thống kê</h4>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <label>Likes:</label>
                                            <span className="stat-value">👍 {selectedFunction.like || 0}</span>
                                        </div>
                                        <div className="stat-item">
                                            <label>Downloads:</label>
                                            <span className="stat-value">⬇️ {selectedFunction.download || 0}</span>
                                        </div>
                                        <div className="stat-item">
                                            <label>Ngày tạo:</label>
                                            <span>{formatDate(selectedFunction.created_at)}</span>
                                        </div>
                                        <div className="stat-item">
                                            <label>Ngày sửa:</label>
                                            <span>{formatDate(selectedFunction.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="info-section">
                                    <h4>Nội dung Code</h4>
                                    <div className="code-content">
                                        <pre>{selectedFunction.content}</pre>
                                    </div>
                                </div>
                                
                                {/* Comment */}
                                {selectedFunction.comment && (
                                    <div className="info-section">
                                        <h4>Ghi chú</h4>
                                        <div className="comment-content">
                                            {selectedFunction.comment}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <div className="no-selection-content">
                                <div className="no-selection-icon">📁</div>
                                <h3>Chưa chọn function</h3>
                                <p>Vui lòng chọn một function từ danh sách bên trái để xem chi tiết</p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleAddFunction}
                                    disabled={!isLoggedIn}
                                >
                                    + Tạo function mới
                                </button>
                                {!isLoggedIn && (
                                    <p className="login-prompt">
                                        <br/>
                                        <small>Bạn cần đăng nhập để tạo và quản lý functions</small>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Dialog Form */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <div className="dialog-header">
                            <h3>{dialogMode === 'add' ? 'Thêm Function mới' : 'Chỉnh sửa Function'}</h3>
                            <button 
                                className="btn-close" 
                                onClick={() => setShowDialog(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="dialog-content">
                            <div className="form-group">
                                <label>Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Nhập tiêu đề function (tối đa 50 ký tự)"
                                    maxLength="50"
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Loại *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="form-select"
                                >
                                    <option value="1">Excel</option>
                                    <option value="2">Access</option>
                                    <option value="3">PowerPoint</option>
                                    <option value="4">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Nội dung Code *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    placeholder="Nhập code VBA..."
                                    rows="10"
                                    className="form-textarea"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                    placeholder="Nhập ghi chú (không bắt buộc)..."
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>
                        </div>
                        
                        <div className="dialog-footer">
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowDialog(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSaveForm}
                            >
                                {dialogMode === 'add' ? 'Tạo mới' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageVBAFunctionManager;