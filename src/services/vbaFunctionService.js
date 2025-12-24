//[file name]: vba_function_service.js
//[Version] 2.0: Service cho quản lý VBA functions với cấu trúc mới

/**
 * Service để xử lý các API liên quan đến VBA functions
 * Tương tác với backend Flask qua API routes đã định nghĩa
 * Hỗ trợ cấu trúc mới: ID là số tự tăng, thêm cột type
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
     * @param {number} options.type - Loại function (0=ALL, 1=EXCEL, 2=ACCESS, 3=POWERPOINT, 4=OTHER)
     * @returns {Promise} Promise với danh sách functions
     */
    static async getAllFunctions(options = {}) {
        try {
            const { show_deleted = false, type = 0 } = options;
            
            // Xây dựng query parameters
            const params = new URLSearchParams();
            if (show_deleted) params.append('show_deleted', 'true');
            if (type !== undefined) params.append('type', type.toString());
            
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
     * @param {number} functionId - ID số của function (ví dụ: 1, 2, 3...)
     * @returns {Promise} Promise với thông tin function
     */
    static async getFunctionDetail(functionId) {
        try {
            if (!functionId && functionId !== 0) {
                throw new Error('Function ID là bắt buộc');
            }

            const url = getApiUrl(`/api/vba-functions/getFunction/${functionId}`);

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
     * Lấy function theo display ID (EXC-0001 format)
     * @param {string} displayId - Display ID dạng EXC-0001
     * @returns {Promise} Promise với thông tin function
     */
    static async getFunctionByDisplayId(displayId) {
        try {
            if (!displayId) {
                throw new Error('Display ID là bắt buộc');
            }

            // Tách số từ display ID
            const parts = displayId.split('-');
            if (parts.length !== 2) {
                throw new Error('Display ID không đúng định dạng (EXC-0001)');
            }
            
            const functionId = parseInt(parts[1]);
            if (isNaN(functionId)) {
                throw new Error('Không thể chuyển đổi Display ID thành số');
            }

            return await this.getFunctionDetail(functionId);
        } catch (error) {
            console.error('Get function by display ID error:', error);
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
                message: data.message || SUCCESS_MESSAGES.CREATE_SUCCESS,
                id: data.id,
                display_id: data.display_id
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
     * @param {number} functionId - ID số của function cần cập nhật
     * @param {Object} functionData - Dữ liệu cần cập nhật
     * @returns {Promise} Promise với kết quả cập nhật
     */
    static async updateFunction(functionId, functionData) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * @param {number} functionId - ID số của function cần xóa
     * @returns {Promise} Promise với kết quả xóa
     */
    static async deleteFunction(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * @param {number} functionId - ID số của function cần xóa mềm
     * @returns {Promise} Promise với kết quả xóa mềm
     */
    static async softDeleteFunction(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * @param {number} functionId - ID số của function cần khôi phục
     * @returns {Promise} Promise với kết quả khôi phục
     */
    static async restoreFunction(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * @param {number} functionId - ID số của function
     * @returns {Promise} Promise với kết quả tăng like
     */
    static async incrementLike(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * @param {number} functionId - ID số của function
     * @returns {Promise} Promise với kết quả tăng download
     */
    static async incrementDownload(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
                table_created: data.table_created || false,
                needs_migration: data.needs_migration || false
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
     * @param {number} options.type - Loại function để filter
     * @returns {Promise} Promise với kết quả tìm kiếm
     */
    static async searchFunctions(searchTerm, options = {}) {
        try {
            const url = `${getApiUrl('/api/vba-functions/search')}?q=${encodeURIComponent(searchTerm)}`;
            
            if (options.type) {
                url += `&type=${options.type}`;
            }

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
                throw new Error(data.error || 'Không thể tìm kiếm functions');
            }

            return {
                success: data.success,
                data: data.data || [],
                count: data.count || 0,
                message: data.message || `Tìm thấy ${data.count || 0} kết quả cho "${searchTerm}"`
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
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
        return this.getAllFunctions({ type: functionType });
    }

    /**
     * Lấy functions mới nhất
     * @param {number} limit - Số lượng function mới nhất cần lấy
     * @returns {Promise} Promise với danh sách functions mới nhất
     */
    static async getLatestFunctions(limit = 5) {
        try {
            const stats = await this.getFunctionsStats();
            
            if (!stats.success || !stats.data || !stats.data.latest_functions) {
                throw new Error('Không thể lấy functions mới nhất');
            }

            const latestData = stats.data.latest_functions.slice(0, limit);

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
     * @param {number} functionId - ID số cần kiểm tra
     * @returns {Promise} Promise với kết quả kiểm tra
     */
    static async checkFunctionId(functionId) {
        try {
            if (functionId === undefined || functionId === null) {
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
     * Lấy loại function từ type number
     * @param {number} type - Số type (1-4)
     * @returns {string} Tên loại function
     */
    static getFunctionTypeName(type) {
        const typeMap = {
            1: 'EXCEL',
            2: 'ACCESS',
            3: 'POWERPOINT',
            4: 'OTHER'
        };
        
        return typeMap[type] || 'OTHER';
    }

    /**
     * Lấy prefix từ type number
     * @param {number} type - Số type (1-4)
     * @returns {string} Prefix string
     */
    static getPrefixFromType(type) {
        const prefixMap = {
            1: 'EXC',
            2: 'ACC',
            3: 'POW',
            4: 'OTH'
        };
        
        return prefixMap[type] || 'OTH';
    }

    /**
     * Lấy display ID từ ID và type
     * @param {number} id - ID số
     * @param {number} type - Loại function (1-4)
     * @returns {string} Display ID dạng EXC-0001
     */
    static getDisplayId(id, type) {
        if (!id && id !== 0) return '';
        const prefix = this.getPrefixFromType(type);
        return `${prefix}-${id.toString().padStart(4, '0')}`;
    }

    /**
     * Lấy type từ prefix
     * @param {string} prefix - Prefix string (EXC, ACC, POW, OTH)
     * @returns {number} Type number (1-4)
     */
    static getTypeFromPrefix(prefix) {
        const prefixMap = {
            'EXC': 1,
            'ACC': 2,
            'POW': 3,
            'OTH': 4
        };
        
        return prefixMap[prefix?.toUpperCase()] || 4;
    }

    /**
     * Chuyển đổi display ID sang ID số
     * @param {string} displayId - Display ID dạng EXC-0001
     * @returns {Object} {id: number, type: number}
     */
    static parseDisplayId(displayId) {
        if (!displayId) return null;
        
        const parts = displayId.split('-');
        if (parts.length !== 2) return null;
        
        const prefix = parts[0];
        const id = parseInt(parts[1]);
        
        return {
            id: isNaN(id) ? null : id,
            type: this.getTypeFromPrefix(prefix)
        };
    }

    /**
     * Lấy màu cho loại function
     * @param {number} type - Số type (1-4)
     * @returns {string} Mã màu hex
     */
    static getFunctionTypeColor(type) {
        const colorMap = {
            1: '#217346',     // Excel green
            2: '#A4373A',    // Access red
            3: '#D24726',    // PowerPoint orange
            4: '#6C757D'     // Bootstrap secondary gray
        };
        
        return colorMap[type] || '#6C757D';
    }

    /**
     * Lấy icon cho loại function
     * @param {number} type - Số type (1-4)
     * @returns {string} Tên icon (FontAwesome class)
     */
    static getFunctionTypeIcon(type) {
        const iconMap = {
            1: 'fa-solid fa-file-excel',
            2: 'fa-solid fa-database',
            3: 'fa-solid fa-file-powerpoint',
            4: 'fa-solid fa-file-code'
        };
        
        return iconMap[type] || 'fa-solid fa-file-code';
    }

    /**
     * Lấy tất cả options type cho select dropdown
     * @returns {Array} Mảng các option type
     */
    static getTypeOptions() {
        return [
            { value: 1, label: 'Excel', color: '#217346', icon: 'fa-solid fa-file-excel' },
            { value: 2, label: 'Access', color: '#A4373A', icon: 'fa-solid fa-database' },
            { value: 3, label: 'PowerPoint', color: '#D24726', icon: 'fa-solid fa-file-powerpoint' },
            { value: 4, label: 'Other', color: '#6C757D', icon: 'fa-solid fa-file-code' }
        ];
    }

    /**
     * Format function data cho hiển thị
     * @param {Object} functionData - Dữ liệu function từ API
     * @returns {Object} Dữ liệu đã format
     */
    static formatFunctionData(functionData) {
        if (!functionData) return null;
        
        const displayId = this.getDisplayId(functionData.id, functionData.type);
        const typeName = this.getFunctionTypeName(functionData.type);
        const typeColor = this.getFunctionTypeColor(functionData.type);
        const typeIcon = this.getFunctionTypeIcon(functionData.type);
        
        return {
            ...functionData,
            display_id: displayId,
            type_name: typeName,
            type_color: typeColor,
            type_icon: typeIcon,
            formatted_created_at: functionData.created_at ? 
                new Date(functionData.created_at).toLocaleDateString('vi-VN') : '',
            formatted_updated_at: functionData.updated_at ? 
                new Date(functionData.updated_at).toLocaleDateString('vi-VN') : ''
        };
    }

    /**
     * Format danh sách functions cho hiển thị
     * @param {Array} functions - Mảng functions từ API
     * @returns {Array} Mảng functions đã format
     */
    static formatFunctionsList(functions) {
        if (!Array.isArray(functions)) return [];
        
        return functions.map(func => this.formatFunctionData(func));
    }

    /**
     * Validate function data trước khi gửi lên server
     * @param {Object} functionData - Dữ liệu function
     * @returns {Object} {isValid: boolean, errors: Array}
     */
    static validateFunctionData(functionData) {
        const errors = [];
        
        if (!functionData.content || functionData.content.trim() === '') {
            errors.push('Nội dung function là bắt buộc');
        }
        
        if (functionData.title && functionData.title.length > 50) {
            errors.push('Tiêu đề không được vượt quá 50 ký tự');
        }
        
        if (functionData.type && ![1, 2, 3, 4].includes(parseInt(functionData.type))) {
            errors.push('Loại function không hợp lệ');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

export default VBAFunctionService;