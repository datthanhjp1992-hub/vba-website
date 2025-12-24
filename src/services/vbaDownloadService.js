/**
 * VBA Download Service
 * Service để download VBA module với template
 */

// Import template trực tiếp từ thư mục src
import VBAModuleDownloadContent from '../template/VBAModule';
// Import VBAFunctionService để tăng download count
import VBAFunctionService from './vbaFunctionService';

class VBADownloadService {
    
    /**
     * Download VBA module từ template
     * @param {Object} func - Function data
     * @param {string} filename - Tên file tải xuống (optional)
     */
    static async downloadVBAModule(func, filename = null) {
        try {
            // Lấy template
            const template = this.loadTemplate();
            
            // Thay thế các placeholder
            const content = this.replacePlaceholders(template, func);
            
            // Tạo tên file mặc định nếu không có
            const downloadFilename = filename || this.generateFilename(func);
            
            // Download file
            this.downloadFile(content, downloadFilename);
            
            return {
                success: true,
                filename: downloadFilename
            };
            
        } catch (error) {
            console.error('Error downloading VBA module:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Load template từ thư mục src
     */
    static loadTemplate() {
        try {
            // Trả về template đã import (nếu có)
            if (VBAModuleDownloadContent) {
                return VBAModuleDownloadContent;
            }
            
            // Fallback nếu không import được
            console.warn('Template not imported, using fallback template');
            return this.getFallbackTemplate();
            
        } catch (error) {
            console.error('Error loading template:', error);
            return this.getFallbackTemplate();
        }
    }
    
    /**
     * Fallback template nếu không load được file
     */
    static getFallbackTemplate() {
        return `'-----------------------------------------
'VBAID: {ID}
'Author : {creater}
'Created: {created_at}
'Updated: {updated_at}
'Comment: {comment}
'-----------------------------------------

{content}`;
    }
    
    /**
     * Thay thế các placeholder trong template với data thực
     * @param {string} template - Template string
     * @param {Object} func - Function data
     */
    static replacePlaceholders(template, func) {
        const placeholders = {
            '{ID}': func.id || '',
            '{creater}': func.creater_name || `User ${func.creater}` || 'Unknown',
            '{created_at}': this.formatDateForTemplate(func.created_at),
            '{updated_at}': this.formatDateForTemplate(func.updated_at),
            '{comment}': func.comment || 'No comment',
            '{content}': func.content || ''
        };
        
        let result = template;
        for (const [placeholder, value] of Object.entries(placeholders)) {
            result = result.replace(new RegExp(this.escapeRegExp(placeholder), 'g'), value);
        }
        
        return result;
    }
    
    /**
     * Format date cho template
     * @param {string} dateString - Date string
     */
    static formatDateForTemplate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            return 'N/A';
        }
    }
    
    /**
     * Escape special characters cho RegExp
     * @param {string} string - String cần escape
     */
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Generate tên file dựa trên function data
     * @param {Object} func - Function data
     */
    static generateFilename(func) {
        // Sử dụng VBAFunctionService để lấy type name
        const typeName = VBAFunctionService.getFunctionTypeName(func.type);
        const id = func.id || '0000';

        return `VBA_${typeName}_${id}.bas`;
    }
    
    /**
     * Tạo và download file
     * @param {string} content - Nội dung file
     * @param {string} filename - Tên file
     */
    static downloadFile(content, filename) {
        // Kiểm tra nếu content là data URL base64
        if (content.startsWith('data:text/plain;base64,')) {
            // Trích xuất phần base64
            const base64Content = content.replace('data:text/plain;base64,', '');
            
            try {
                // Giải mã base64 thành binary
                const binaryString = atob(base64Content);
                const bytes = new Uint8Array(binaryString.length);
                
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Tạo blob từ binary data
                const blob = new Blob([bytes], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                this.triggerDownload(url, filename);
                return;
                
            } catch (error) {
                console.error('Error decoding base64 content:', error);
                // Fallback to regular text
            }
        }
        
        // Nếu không phải base64, xử lý như bình thường
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        this.triggerDownload(url, filename);
    }

    /**
     * Helper function để trigger download
     */
    static triggerDownload(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`Downloaded: ${filename}`);
    }
    
    /**
     * Tăng download count trên server
     * @param {number} functionId - ID của function
     */
    static async incrementDownloadCount(functionId) {
        try {
            // Sử dụng VBAFunctionService để tăng download count
            const result = await VBAFunctionService.incrementDownload(functionId);
            
            if (result.success) {
                console.log('Download count incremented successfully');
                return true;
            } else {
                console.warn('Failed to increment download count:', result.message);
                return false;
            }
            
        } catch (error) {
            console.error('Error incrementing download count:', error);
            return false;
        }
    }
}

export default VBADownloadService;