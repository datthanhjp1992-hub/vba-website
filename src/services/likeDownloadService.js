//[file name]: likeDownloadService.js

import AccountService from './account_service';
import { LIKE_DOWNLOAD_INTERVAL } from './constants';

class LikeDownloadService {
    constructor() {
        this.intervalId = null;
        this.callback = null;
        this.userId = null;
    }

    /**
     * Bắt đầu kiểm tra định kỳ
     * @param {number} userId - ID người dùng
     * @param {Function} callback - Hàm callback khi có dữ liệu mới
     * @returns {Object} Controller để dừng
     */
    startPeriodicCheck(userId, callback) {
        // Dừng interval cũ nếu có
        this.stop();

        this.userId = userId;
        this.callback = callback;

        // Hàm kiểm tra
        const checkLikeDownload = async () => {
            try {
                const result = await AccountService.getLikeDownloadByIndex(userId);
                
                if (result.success && result.data) {
                    callback({
                        success: true,
                        data: {
                            like: result.data.total_likes || 0,
                            download: result.data.total_downloads || 0
                        }
                    });
                }
            } catch (error) {
                console.error('Error checking like/download:', error);
                callback({
                    success: false,
                    error: error.message
                });
            }
        };

        // Kiểm tra ngay lần đầu
        checkLikeDownload();

        // Thiết lập interval
        this.intervalId = setInterval(
            checkLikeDownload, 
            LIKE_DOWNLOAD_INTERVAL.INTERVAL
        );

        // Trả về controller
        return {
            stop: () => this.stop(),
            userId: userId
        };
    }

    /**
     * Dừng kiểm tra định kỳ
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.callback = null;
            this.userId = null;
        }
    }

    /**
     * Kiểm tra một lần
     * @param {number} userId - ID người dùng
     * @returns {Promise} Promise với kết quả
     */
    async checkOnce(userId) {
        try {
            const result = await AccountService.getLikeDownloadByIndex(userId);
            
            if (result.success && result.data) {
                return {
                    success: true,
                    data: {
                        like: result.data.total_likes || 0,
                        download: result.data.total_downloads || 0
                    }
                };
            }
            
            return {
                success: false,
                data: null
            };
        } catch (error) {
            console.error('Error checking like/download once:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Kiểm tra xem có đang chạy không
     * @returns {boolean}
     */
    isRunning() {
        return this.intervalId !== null;
    }
}

// Export singleton instance
export default new LikeDownloadService();