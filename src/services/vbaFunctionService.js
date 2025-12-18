//[file name]: vba_function_service.js
//[Version] 1.0: Service cho quản lý VBA functions

/**
 * Service để xử lý các API liên quan đến VBA functions
 * Tương tác với backend Flask qua API routes đã định nghĩa
 */

import { 
    SERVER_CONFIG,
    API_ENDPOINTS,
    STORAGE_KEYS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    getApiUrl,
    getErrorMessage,
    validateEmail,
    isAdmin,
    isModerator
} from './constants';

class VBAFunctionService {
    /**
     * Lấy danh sách tất cả VBA functions
     * @param {Object} options - Tùy chọn filter và pagination
     * @param {boolean} options.show_deleted - Hiển thị các bản ghi đã xóa mềm
     * @param {number} options.prefix - Loại function (0=ALL, 1=EXCEL, 2=ACCESS, 3=POWERPOINT, 4=OTHER)
     * @returns {Promise} Promise với danh sách functions
     */
    static async getAllFunctions(options = {}) {
        try {
            const { show_deleted = false, prefix = 0 } = options;
            
            // Xây dựng query parameters
            const params = new URLSearchParams();
            if (show_deleted) params.append('show_deleted', 'true');
            if (prefix !== undefined) params.append('prefix', prefix.toString());
            
            const url = `${getApiUrl('/api/vba-functions')}${params.toString() ? '?' + params.toString() : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || getErrorMessage(response.status));
            }

            return {
                success: data.success,
                data: data.data || [],
                count: data.count || 0,
                message: data.message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Get all VBA functions error:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết một VBA function
     * @param {string} functionId - ID của function (ví dụ: EXC-0001)
     * @returns {Promise} Promise với thông tin function
     */
    static async getFunctionDetail(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || getErrorMessage(response.status));
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Get VBA function detail error:', error);
            throw error;
        }
    }

    /**
     * Tạo mới VBA function
     * @param {Object} functionData - Dữ liệu function mới
     * @param {string} functionData.content - Nội dung code (bắt buộc)
     * @param {string} functionData.title - Tiêu đề function
     * @param {string} functionData.comment - Ghi chú
     * @param {number} functionData.type - Loại function (1=Excel, 2=Access, 3=PowerPoint, 4=Other)
     * @param {string} functionData.creater - Người tạo
     * @param {number} functionData.like - Số lượt like
     * @param {number} functionData.download - Số lượt download
     * @returns {Promise} Promise với kết quả tạo mới
     */
    static async createFunction(functionData) {
        try {
            // Validate required fields
            if (!functionData || !functionData.content) {
                throw new Error('Nội dung function là bắt buộc');
            }

            // Validate function type
            if (functionData.type && ![1, 2, 3, 4].includes(functionData.type)) {
                throw new Error('Loại function không hợp lệ. Phải là 1, 2, 3 hoặc 4');
            }

            const url = getApiUrl('/api/vba-functions');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(functionData),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.VALIDATION_ERROR);
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || SUCCESS_MESSAGES.REGISTER_SUCCESS,
                auto_generated_id: data.auto_generated_id
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Create VBA function error:', error);
            throw error;
        }
    }

    /**
     * Cập nhật VBA function
     * @param {string} functionId - ID của function cần cập nhật
     * @param {Object} functionData - Dữ liệu cần cập nhật
     * @returns {Promise} Promise với kết quả cập nhật
     */
    static async updateFunction(functionId, functionData) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            if (!functionData || Object.keys(functionData).length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}`);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(functionData),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.UPDATE_ERROR);
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || SUCCESS_MESSAGES.UPDATE_SUCCESS
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Update VBA function error:', error);
            throw error;
        }
    }

    /**
     * Xóa cứng VBA function (xóa vĩnh viễn)
     * @param {string} functionId - ID của function cần xóa
     * @returns {Promise} Promise với kết quả xóa
     */
    static async deleteFunction(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}`);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.DELETE_ERROR);
            }

            return {
                success: data.success,
                message: data.message || SUCCESS_MESSAGES.DELETE_SUCCESS
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Delete VBA function error:', error);
            throw error;
        }
    }

    /**
     * Xóa mềm VBA function (chỉ đặt cờ delete_flag)
     * @param {string} functionId - ID của function cần xóa mềm
     * @returns {Promise} Promise với kết quả xóa mềm
     */
    static async softDeleteFunction(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}/soft-delete`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.DELETE_ERROR);
            }

            return {
                success: data.success,
                message: data.message || 'Đã xóa mềm function thành công'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Soft delete VBA function error:', error);
            throw error;
        }
    }

    /**
     * Khôi phục VBA function đã xóa mềm
     * @param {string} functionId - ID của function cần khôi phục
     * @returns {Promise} Promise với kết quả khôi phục
     */
    static async restoreFunction(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}/restore`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể khôi phục function');
            }

            return {
                success: data.success,
                message: data.message || 'Đã khôi phục function thành công'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Restore VBA function error:', error);
            throw error;
        }
    }

    /**
     * Tăng số lượt like cho function
     * @param {string} functionId - ID của function
     * @returns {Promise} Promise với kết quả tăng like
     */
    static async incrementLike(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}/like`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể tăng like');
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || 'Đã tăng like thành công'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Increment like error:', error);
            throw error;
        }
    }

    /**
     * Tăng số lượt download cho function
     * @param {string} functionId - ID của function
     * @returns {Promise} Promise với kết quả tăng download
     */
    static async incrementDownload(functionId) {
        try {
            if (!functionId) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/${functionId}/download`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể tăng download');
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || 'Đã tăng download thành công'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Increment download error:', error);
            throw error;
        }
    }

    /**
     * Lấy thống kê về VBA functions
     * @returns {Promise} Promise với thông tin thống kê
     */
    static async getFunctionsStats() {
        try {
            const url = getApiUrl('/api/vba-functions/stats');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể lấy thống kê');
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Get VBA functions stats error:', error);
            throw error;
        }
    }

    /**
     * Tạo bảng VBA function trong database
     * @returns {Promise} Promise với kết quả tạo bảng
     */
    static async createVBAFunctionTable() {
        try {
            const url = getApiUrl('/db/createVBAFunctionTable');

            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Không thể tạo bảng VBA function');
            }

            return {
                success: data.success,
                message: data.message || '',
                table_created: data.table_created || false
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Create VBA function table error:', error);
            throw error;
        }
    }

    /**
     * Tìm kiếm VBA functions
     * @param {string} searchTerm - Từ khóa tìm kiếm
     * @param {Object} options - Tùy chọn tìm kiếm
     * @returns {Promise} Promise với kết quả tìm kiếm
     */
    static async searchFunctions(searchTerm, options = {}) {
        try {
            // Lấy tất cả functions và filter client-side
            // (Có thể implement server-side search nếu backend hỗ trợ)
            const result = await this.getAllFunctions(options);
            
            if (!result.success || !result.data) {
                return result;
            }

            if (!searchTerm || searchTerm.trim() === '') {
                return result;
            }

            const searchLower = searchTerm.toLowerCase().trim();
            const filteredData = result.data.filter(func => {
                return (
                    (func.title && func.title.toLowerCase().includes(searchLower)) ||
                    (func.content && func.content.toLowerCase().includes(searchLower)) ||
                    (func.comment && func.comment.toLowerCase().includes(searchLower)) ||
                    (func.id && func.id.toLowerCase().includes(searchLower)) ||
                    (func.creater && func.creater.toLowerCase().includes(searchLower))
                );
            });

            return {
                success: true,
                data: filteredData,
                count: filteredData.length,
                message: `Tìm thấy ${filteredData.length} kết quả cho "${searchTerm}"`
            };
        } catch (error) {
            console.error('Search VBA functions error:', error);
            throw error;
        }
    }

    /**
     * Lấy functions theo loại
     * @param {number} functionType - Loại function (1-4)
     * @returns {Promise} Promise với danh sách functions
     */
    static async getFunctionsByType(functionType) {
        return this.getAllFunctions({ prefix: functionType });
    }

    /**
     * Lấy functions mới nhất
     * @param {number} limit - Số lượng function mới nhất cần lấy
     * @returns {Promise} Promise với danh sách functions mới nhất
     */
    static async getLatestFunctions(limit = 5) {
        try {
            const result = await this.getAllFunctions();
            
            if (!result.success || !result.data) {
                return result;
            }

            // Sắp xếp theo created_at giảm dần
            const sortedData = [...result.data].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateB - dateA;
            });

            // Lấy số lượng theo limit
            const latestData = sortedData.slice(0, limit);

            return {
                success: true,
                data: latestData,
                count: latestData.length,
                message: `Lấy ${latestData.length} functions mới nhất`
            };
        } catch (error) {
            console.error('Get latest functions error:', error);
            throw error;
        }
    }

    /**
     * Lấy functions được like nhiều nhất
     * @param {number} limit - Số lượng function cần lấy
     * @returns {Promise} Promise với danh sách functions
     */
    static async getTopLikedFunctions(limit = 5) {
        try {
            const result = await this.getAllFunctions();
            
            if (!result.success || !result.data) {
                return result;
            }

            // Sắp xếp theo like giảm dần
            const sortedData = [...result.data].sort((a, b) => b.like - a.like);

            // Lấy số lượng theo limit
            const topData = sortedData.slice(0, limit);

            return {
                success: true,
                data: topData,
                count: topData.length,
                message: `Lấy ${topData.length} functions được like nhiều nhất`
            };
        } catch (error) {
            console.error('Get top liked functions error:', error);
            throw error;
        }
    }

    /**
     * Lấy functions được download nhiều nhất
     * @param {number} limit - Số lượng function cần lấy
     * @returns {Promise} Promise với danh sách functions
     */
    static async getTopDownloadedFunctions(limit = 5) {
        try {
            const result = await this.getAllFunctions();
            
            if (!result.success || !result.data) {
                return result;
            }

            // Sắp xếp theo download giảm dần
            const sortedData = [...result.data].sort((a, b) => b.download - a.download);

            // Lấy số lượng theo limit
            const topData = sortedData.slice(0, limit);

            return {
                success: true,
                data: topData,
                count: topData.length,
                message: `Lấy ${topData.length} functions được download nhiều nhất`
            };
        } catch (error) {
            console.error('Get top downloaded functions error:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra ID function có tồn tại không
     * @param {string} functionId - ID cần kiểm tra
     * @returns {Promise} Promise với kết quả kiểm tra
     */
    static async checkFunctionId(functionId) {
        try {
            if (!functionId) {
                return {
                    success: false,
                    exists: false,
                    message: 'Function ID là bắt buộc'
                };
            }

            const result = await this.getFunctionDetail(functionId);
            
            return {
                success: true,
                exists: result.success && result.data !== null,
                message: result.success ? 'Function ID đã tồn tại' : 'Function ID chưa tồn tại'
            };
        } catch (error) {
            console.error('Check function ID error:', error);
            return {
                success: false,
                exists: false,
                message: error.message || 'Lỗi khi kiểm tra Function ID'
            };
        }
    }

    /**
     * Export function data
     * @param {string} functionId - ID của function
     * @returns {Object} Dữ liệu function dưới dạng object
     */
    static exportFunctionData(functionData) {
        if (!functionData) {
            return null;
        }

        return {
            id: functionData.id,
            title: functionData.title,
            content: functionData.content,
            comment: functionData.comment,
            type: this.getFunctionTypeFromId(functionData.id),
            like: functionData.like,
            download: functionData.download,
            created_at: functionData.created_at,
            creater: functionData.creater,
            updated_at: functionData.updated_at
        };
    }

    /**
     * Lấy loại function từ ID
     * @param {string} functionId - ID của function
     * @returns {string} Loại function
     */
    static getFunctionTypeFromId(functionId) {
        if (!functionId) return 'OTHER';
        
        const prefix = functionId.split('-')[0];
        const typeMap = {
            'EXC': 'EXCEL',
            'ACC': 'ACCESS',
            'POW': 'POWERPOINT',
            'OTH': 'OTHER'
        };
        
        return typeMap[prefix] || 'OTHER';
    }

    /**
     * Lấy màu cho loại function
     * @param {string} functionId - ID của function
     * @returns {string} Mã màu hex
     */
    static getFunctionTypeColor(functionId) {
        const type = this.getFunctionTypeFromId(functionId);
        const colorMap = {
            'EXCEL': '#217346',     // Excel green
            'ACCESS': '#A4373A',    // Access red
            'POWERPOINT': '#D24726', // PowerPoint orange
            'OTHER': '#6C757D'      // Bootstrap secondary gray
        };
        
        return colorMap[type] || '#6C757D';
    }

    /**
     * Lấy icon cho loại function
     * @param {string} functionId - ID của function
     * @returns {string} Tên icon (FontAwesome class)
     */
    static getFunctionTypeIcon(functionId) {
        const type = this.getFunctionTypeFromId(functionId);
        const iconMap = {
            'EXCEL': 'fa-solid fa-file-excel',
            'ACCESS': 'fa-solid fa-database',
            'POWERPOINT': 'fa-solid fa-file-powerpoint',
            'OTHER': 'fa-solid fa-file-code'
        };
        
        return iconMap[type] || 'fa-solid fa-file-code';
    }
}

export default VBAFunctionService;