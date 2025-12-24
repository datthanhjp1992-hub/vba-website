import '../css/pageVBAFunctionView.css';
import React, { useState, useEffect } from 'react';
import AccountService from '../services/account_service';
import ConnectionService from '../services/connection_service';
import {
    SERVER_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    getApiUrl
} from '../services/constants';

const PageVBAFunctionView = () => {
    // State cho tìm kiếm và filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCreator, setFilterCreator] = useState('');
    
    // State cho functions
    const [functions, setFunctions] = useState([]);
    const [filteredFunctions, setFilteredFunctions] = useState([]);
    const [displayFunctions, setDisplayFunctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State cho pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    
    // State cho thông báo
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Load data khi component mount
    useEffect(() => {
        loadUserAndFunctions();
    }, []);

    // Cập nhật filteredFunctions và pagination khi dữ liệu hoặc filter thay đổi
    useEffect(() => {
        applyFilters();
    }, [functions, searchTerm, filterType, filterCreator]);

    // Cập nhật displayFunctions khi filteredFunctions hoặc currentPage thay đổi
    useEffect(() => {
        updateDisplayFunctions();
    }, [filteredFunctions, currentPage]);

    // Tải user hiện tại và functions
    const loadUserAndFunctions = async () => {
        try {
            // Lấy user từ AccountService
            const user = AccountService.getCurrentUser();
            setCurrentUser(user);

            // Load functions - user_id = 0 để lấy tất cả functions
            await loadFunctions(0);
        } catch (error) {
            console.error('Error loading user and functions:', error);
            showNotification('Lỗi khi tải dữ liệu', 'error');
            setLoading(false);
        }
    };

    // Load functions từ server - SỬA LẠI THEO API SERVER
    const loadFunctions = async (userId = 0) => {
        try {
            setLoading(true);
            
            // Kiểm tra kết nối trước khi load
            const connection = await ConnectionService.quickCheck();
            if (!connection.connected) {
                showNotification('Mất kết nối đến server', 'error');
                setLoading(false);
                return;
            }
            
            // Xây dựng URL theo đúng API server - user_id = 0 để lấy tất cả
            const baseUrl = SERVER_CONFIG.BASE_URL;
            const url = `${baseUrl}api/vba-functions/${userId}`;
            
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
                // Format dữ liệu function đơn giản
                const formattedFunctions = data.data.map(func => {
                    // Màu sắc cho loại function
                    const colorMap = {
                        1: '#217346', // Excel green
                        2: '#A4373A', // Access red
                        3: '#D24726', // PowerPoint orange
                        4: '#6C757D'  // Other gray
                    };
                    
                    // Tên loại function
                    const nameMap = {
                        1: 'EXCEL',
                        2: 'ACCESS',
                        3: 'POWERPOINT',
                        4: 'OTHER'
                    };
                    
                    const typeColor = colorMap[func.type] || '#6C757D';
                    const typeName = nameMap[func.type] || 'OTHER';
                    
                    return {
                        ...func,
                        type_color: typeColor,
                        type_name: typeName,
                        // Đảm bảo có display_id, nếu không có thì tạo từ id và type
                        display_id: func.display_id || `${func.type === 1 ? 'EXC' : 
                                                         func.type === 2 ? 'ACC' : 
                                                         func.type === 3 ? 'POW' : 'OTH'}-${func.id.toString().padStart(4, '0')}`
                    };
                });
                
                setFunctions(formattedFunctions);
                console.log(`Loaded ${formattedFunctions.length} functions for user_id: ${userId}`);
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

    // Áp dụng filter
    const applyFilters = () => {
        if (!functions || functions.length === 0) {
            setFilteredFunctions([]);
            setDisplayFunctions([]);
            setCurrentPage(1);
            setTotalPages(1);
            return;
        }

        let filtered = [...functions];

        // Filter theo type
        if (filterType !== 'all') {
            filtered = filtered.filter(func => 
                func.type === parseInt(filterType)
            );
        }

        // Filter dựa vào title
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(func => {
                return (
                    (func.title && func.title.toLowerCase().includes(term)) /*||
                    (func.content && func.content.toLowerCase().includes(term)) ||
                    (func.comment && func.comment.toLowerCase().includes(term)) ||
                    (func.display_id && func.display_id.toLowerCase().includes(term)) ||
                    (func.type_name && func.type_name.toLowerCase().includes(term))*/
                );
            });
        }

        // Filter theo mã tác giả (creater)
        if (filterCreator.trim() !== '') {
            const creatorTerm = filterCreator.toLowerCase();
            console.log('Tìm kiếm tác giả với term:', creatorTerm);
            
            filtered = filtered.filter(func => {
                const createrStr = func.creater ? func.creater.toString() : '';
                const createrName = func.creater_name ? func.creater_name.toLowerCase() : '';
                /*
                console.log(`Function ${func.id}:`, {
                    creater: func.creater,
                    createrStr,
                    createrName,
                    matches: createrStr.includes(creatorTerm) || createrName.includes(creatorTerm)
                });*/
                
                return (
                    createrStr.includes(creatorTerm) || 
                    createrName.includes(creatorTerm)
                );
            });
            
            console.log('Sau khi filter theo tác giả:', filtered.length);
        }

        setFilteredFunctions(filtered);
        
        // Tính toán total pages
        const totalPagesCount = Math.ceil(filtered.length / pageSize);
        setTotalPages(totalPagesCount);
        
        // Reset về trang 1 nếu filter thay đổi
        setCurrentPage(1);
    };

    // Reset filter
    const handleResetFilter = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterCreator(''); // Reset thêm filter tác giả
    };

    // Cập nhật functions hiển thị dựa trên trang hiện tại
    const updateDisplayFunctions = () => {
        if (!filteredFunctions || filteredFunctions.length === 0) {
            setDisplayFunctions([]);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentFunctions = filteredFunctions.slice(startIndex, endIndex);
        
        setDisplayFunctions(currentFunctions);
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

    // Xử lý click vào function row
    const handleFunctionClick = (func) => {
        window.showPageVBAFunctionDetails(func);
    };

    // Format ngày tháng đơn giản
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return '';
        }
    };

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

    // Refresh data
    const handleRefresh = () => {
        // Load functions với user_id = 0 để lấy tất cả
        loadFunctions(0);
    };

    // Xử lý chuyển trang
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Xử lý chuyển đến trang cụ thể
    const handleGoToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Xử lý chuyển đổi giữa view tất cả và view của user
    const handleToggleView = () => {
        const user = AccountService.getCurrentUser();
        if (user && user.index) {
            // Đang xem tất cả -> chuyển sang xem của user
            if (currentUser?.index !== user.index) {
                setCurrentUser(user);
                loadFunctions(user.index);
                showNotification(`Đang xem functions của bạn`, 'info');
            } else {
                // Đang xem của user -> chuyển sang xem tất cả
                setCurrentUser(null);
                loadFunctions(0);
                showNotification(`Đang xem tất cả functions`, 'info');
            }
        }
    };

    return (
        <div className="pageVBAFunctionView">
            {/* Header */}
            <div className="view-header">
                <h2>Danh sách VBA Functions</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleRefresh}
                    >
                        <span className="btn-icon">↻</span> Làm mới
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleResetFilter}
                        disabled={searchTerm === '' && filterType === 'all'}
                    >
                        <span className="btn-icon">↶</span> Xóa filter
                    </button>
                    {AccountService.isLoggedIn() && (
                        <button
                            className="btn btn-info"
                            onClick={handleToggleView}
                        >
                            <span className="btn-icon">👁️</span>
                            {currentUser?.index ? 'Xem tất cả' : 'Xem của tôi'}
                        </button>
                    )}
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Filter Panel với bố cục mới */}
            <div id="pageVBAFunctionViewFilterPanel" className="filter-panel">
                <div className="panel-header">
                    <h3>Bộ lọc tìm kiếm</h3>
                </div>
                
                <div className="filter-controls">
                    {/* Dòng 1: Tất cả bộ lọc trên cùng một hàng */}
                    <div className="filter-row">
                        {/* Search by name/content */}
                        <div className="filter-group">
                            <label>Tìm kiếm nội dung:</label>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, nội dung, comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                        </div>

                        {/* Filter by type */}
                        <div className="filter-group">
                            <label>Loại function:</label>
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
                        </div>

                        {/* Filter by creator */}
                        <div className="filter-group">
                            <label>Tác giả:</label>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc mã tác giả..."
                                    value={filterCreator}
                                    onChange={(e) => setFilterCreator(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">👤</span>
                            </div>
                        </div>
                    </div>

                    {/* Dòng 2: Thống kê */}
                    <div className="filter-stats">
                        <div className="stat-item">
                            <span className="stat-label">Tổng số:</span>
                            <span className="stat-value">{functions.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Hiển thị:</span>
                            <span className="stat-value">{filteredFunctions.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Trang:</span>
                            <span className="stat-value">{currentPage}/{totalPages}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Panel */}
            <div id="pageVBAFunctionViewContentPanel" className="content-panel">
                <div className="panel-header">
                    <h3>Danh sách Functions</h3>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Đang tải dữ liệu...</div>
                    </div>
                ) : filteredFunctions.length === 0 ? (
                    <div className="empty-message">
                        {searchTerm || filterType !== 'all' ? (
                            <>
                                <div className="empty-icon">🔍</div>
                                <h3>Không tìm thấy function nào</h3>
                                <p>Không có function nào phù hợp với bộ lọc của bạn</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleResetFilter}
                                >
                                    Xóa bộ lọc
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="empty-icon">📁</div>
                                <h3>Chưa có function nào</h3>
                                <p>Hiện chưa có function nào trong hệ thống</p>
                                {AccountService.isLoggedIn() && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleToggleView}
                                    >
                                        Thử xem functions của bạn
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="functions-table-container">
                            <table className="functions-table">
                                <thead>
                                    <tr>
                                        <th className="col-id">ID</th>
                                        <th className="col-type">Loại</th>
                                        <th className="col-comment">Comment</th>
                                        <th className="col-like">Like</th>
                                        <th className="col-download">Download</th>
                                        <th className="col-date">Ngày tạo</th>
                                        <th className="col-creator">Người tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayFunctions.map(func => (
                                        <tr 
                                            key={func.id}
                                            className="function-row"
                                            onClick={() => handleFunctionClick(func)}
                                        >
                                            <td className="col-id">
                                                <div className="function-id-cell">
                                                    <span 
                                                        className="function-id-badge"
                                                        style={{ backgroundColor: func.type_color || getTypeColor(func.type) }}
                                                    >
                                                        {func.display_id}
                                                    </span>
                                                    <div className="function-title">
                                                        {func.title || 'Untitled Function'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="col-type">
                                                <span 
                                                    className="type-badge"
                                                    style={{
                                                        backgroundColor: func.type_color || getTypeColor(func.type),
                                                        color: 'white'
                                                    }}
                                                >
                                                    {func.type_name || getTypeName(func.type)}
                                                </span>
                                            </td>
                                            <td className="col-comment">
                                                <div className="comment-cell">
                                                    {func.comment ? (
                                                        <div className="comment-text">
                                                            {func.comment.length > 100 
                                                                ? `${func.comment.substring(0, 100)}...` 
                                                                : func.comment
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="no-comment">Không có comment</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="col-like">
                                                <div className="stat-cell">
                                                    <span className="stat-icon">👍</span>
                                                    <span className="stat-value">{func.like || 0}</span>
                                                </div>
                                            </td>
                                            <td className="col-download">
                                                <div className="stat-cell">
                                                    <span className="stat-icon">⬇️</span>
                                                    <span className="stat-value">{func.download || 0}</span>
                                                </div>
                                            </td>
                                            <td className="col-date">
                                                {formatDate(func.created_at)}
                                            </td>
                                            <td className="col-creator">
                                                <div className="creator-cell">
                                                    {func.creater_name || `User ${func.creater}`}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button 
                                className="btn-prev"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                ← Trước
                            </button>
                            
                            <div className="page-numbers">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handleGoToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <span className="page-info">
                                Trang {currentPage} / {totalPages} (Hiển thị {displayFunctions.length}/{filteredFunctions.length})
                            </span>
                            
                            <button 
                                className="btn-next"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Sau →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PageVBAFunctionView;