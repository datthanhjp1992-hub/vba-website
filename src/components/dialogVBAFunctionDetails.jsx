import React, { useState, useEffect } from 'react';
import '../css/dialogVBAFunctionDetails.css';
import VBADownloadService from '../services/vbaDownloadService';
import VBAFunctionService from '../services/vbaFunctionService';

const DialogVBAFunctionDetails = ({ func, onBack }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        content: '',
        comment: '',
        type: '',
        like: '',
        download: '',
        created_at: '',
        updated_at: '',
        creater: '',
        creater_name: ''
    });

    const [copyStatus, setCopyStatus] = useState({
        isCopied: false,
        showNotification: false
    });

    const [downloadStatus, setDownloadStatus] = useState({
        isDownloading: false,
        message: '',
        showNotification: false
    });

    const getTypeColor = (type) => {
        const colorMap = {
            1: '#217346',
            2: '#A4373A',
            3: '#D24726',
            4: '#6C757D'
        };
        return colorMap[type] || '#6C757D';
    };

    const getTypeName = (type) => {
        const nameMap = {
            1: 'EXCEL',
            2: 'ACCESS',
            3: 'POWERPOINT',
            4: 'OTHER'
        };
        return nameMap[type] || 'OTHER';
    };

    const formatDate = (dateString) => {
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
    };

    const formatCreatorName = (creater, creater_name) => {
        if (creater_name) return creater_name;
        if (creater) return `User ${creater}`;
        return 'Unknown';
    };

    const copyToClipboard = async () => {
        if (!formData.content) {
            console.log('No content to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(formData.content);
            
            setCopyStatus({
                isCopied: true,
                showNotification: true
            });

            setTimeout(() => {
                setCopyStatus(prev => ({
                    ...prev,
                    isCopied: false
                }));
            }, 2000);

            setTimeout(() => {
                setCopyStatus(prev => ({
                    ...prev,
                    showNotification: false
                }));
            }, 2000);

            console.log('Content copied to clipboard');
        } catch (error) {
            console.error('Failed to copy content:', error);
            
            try {
                const textArea = document.createElement('textarea');
                textArea.value = formData.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    setCopyStatus({
                        isCopied: true,
                        showNotification: true
                    });
                    
                    setTimeout(() => {
                        setCopyStatus(prev => ({
                            ...prev,
                            isCopied: false
                        }));
                    }, 2000);
                    
                    setTimeout(() => {
                        setCopyStatus(prev => ({
                            ...prev,
                            showNotification: false
                        }));
                    }, 2000);
                } else {
                    alert('Không thể copy nội dung. Vui lòng thử lại.');
                }
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                alert('Lỗi khi copy nội dung: ' + fallbackError.message);
            }
        }
    };

    const handleDownload = async () => {
        if (!formData.content) {
            alert('Không có nội dung để download');
            return;
        }

        try {
            setDownloadStatus({
                isDownloading: true,
                message: 'Đang chuẩn bị download...',
                showNotification: false
            });

            // Download VBA module
            const result = await VBADownloadService.downloadVBAModule(formData);
            
            if (result.success) {
                setDownloadStatus({
                    isDownloading: false,
                    message: `Đã download thành công: ${result.filename}`,
                    showNotification: true
                });

                // Tăng download count trên server
                await VBADownloadService.incrementDownloadCount(formData.id);

                await refreshFunctionInformation();

                // Ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setDownloadStatus(prev => ({
                        ...prev,
                        showNotification: false
                    }));
                }, 3000);

            } else {
                throw new Error(result.error || 'Download failed');
            }
            
        } catch (error) {
            console.error('Download error:', error);
            setDownloadStatus({
                isDownloading: false,
                message: `Lỗi download: ${error.message}`,
                showNotification: true
            });
            
            // Ẩn thông báo lỗi sau 3 giây
            setTimeout(() => {
                setDownloadStatus(prev => ({
                    ...prev,
                    showNotification: false
                }));
            }, 3000);
        }
    };

    const handleBackClick = () => {
        console.log('Back button clicked, returning to VBA Function View');
        if (onBack) {
            onBack();
        } else {
            if (typeof window.showPageVBAFunctionView === 'function') {
                window.showPageVBAFunctionView();
            } else {
                console.warn('No back handler available');
            }
        }
    };


    const refreshFunctionInformation = async () => {
        try {
            let functID = func.id;
            let response = await VBAFunctionService.getFunctionDetail(functID);  // ✅ Thêm await
            
            if (!response.success) {
                console.log(functID, " dont existed");
                return;
            }
            console.log(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error('Error refreshing function information:', error);
        }
    }

    useEffect(() => {
        if (!func)  {
            console.log('Don\'t get any function');
            return;
        }
        setFormData(func);
    }, [func]);

    return (
        <div id="dialogVBAFunctionDetailsForm">
            {copyStatus.showNotification && (
                <div className="copy-notification">
                    <span>📋</span>
                    <span>Đã copy nội dung vào clipboard!</span>
                </div>
            )}

            {downloadStatus.showNotification && (
                <div className={`copy-notification ${downloadStatus.isDownloading ? 'downloading' : 'downloaded'}`}>
                    <span>{downloadStatus.isDownloading ? '⏳' : '✅'}</span>
                    <span>{downloadStatus.message}</span>
                </div>
            )}

            <div id="dialogVBAFunctionDetailsFormHeader">
                <div id="dialogVBAFunctionDetailsFormTitle">
                    <span>VBA Function Details</span>
                    <span>{formData.title || 'Untitled Function'}</span>
                </div>
            </div>

            <div id="dialogVBAFunctionDetailsFormBody">
                <div>
                    <span>Function ID:</span>
                    <span>{formData.id || 'N/A'}</span>
                </div>

                <div>
                    <span>Type:</span>
                    <span style={{ backgroundColor: getTypeColor(formData.type) }}>
                        {getTypeName(formData.type)}
                    </span>
                </div>

                <div>
                    <span>Content:</span>
                    <div className="content-wrapper">
                        <div className="content-container">
                            <button 
                                className={`copy-button ${copyStatus.isCopied ? 'copied' : ''}`}
                                onClick={copyToClipboard}
                                title="Copy nội dung vào clipboard"
                            >
                                <span className="copy-icon">
                                    {copyStatus.isCopied ? '✓' : '📋'}
                                </span>
                                <span className="copy-text">
                                    {copyStatus.isCopied ? 'Đã copy!' : 'Copy code'}
                                </span>
                            </button>
                            
                            <pre className="content-text">
                                {formData.content || 'No content available'}
                            </pre>
                        </div>
                    </div>
                </div>

                <div>
                    <span>Comment:</span>
                    <span>{formData.comment || 'No comment available'}</span>
                </div>

                <div>
                    <span>Likes:</span>
                    <span>{formData.like || 0}</span>
                </div>

                <div>
                    <span>Downloads:</span>
                    <div className="download-count-container">
                        <span>{formData.download || 0}</span>
                        <div className="download-button-container">
                        <button 
                            className={`download-button ${downloadStatus.isDownloading ? 'downloading' : ''}`}
                            onClick={handleDownload}
                            title="Download VBA module"
                            disabled={downloadStatus.isDownloading}
                        >
                            <span className="download-icon">
                                {downloadStatus.isDownloading ? '⏳' : ''}
                            </span>
                        </button>
                        </div>
                    </div>
                </div>

                <div>
                    <span>Created Date:</span>
                    <span>{formatDate(formData.created_at)}</span>
                </div>

                <div>
                    <span>Author:</span>
                    <span>{formatCreatorName(formData.creater, formData.creater_name)}</span>
                </div>

                {formData.updated_at && formData.updated_at !== formData.created_at && (
                    <div style={{ gridColumn: 'span 2' }}>
                        <span>Last Updated:</span>
                        <span>{formatDate(formData.updated_at)}</span>
                    </div>
                )}
            </div>

            <div className="dialog-footer">
                <button 
                    className="back-button"
                    onClick={handleBackClick}
                    title="Quay lại danh sách functions"
                >
                    <span className="back-icon">←</span>
                    <span className="back-text">Quay lại danh sách</span>
                </button>
            </div>
        </div>
    );
};

export default DialogVBAFunctionDetails;