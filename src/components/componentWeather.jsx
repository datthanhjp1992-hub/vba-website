import React, { useState, useEffect } from 'react';
import '../css/componentWeather.css';
import { fetchWeatherData, getLocationName } from '../services/componentWeather';

const ComponentWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        
        // Lấy vị trí hiện tại
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        // Lấy tên địa điểm
        const locationName = await getLocationName(latitude, longitude);
        setLocation(locationName);
        
        // Lấy dữ liệu thời tiết
        const data = await fetchWeatherData(latitude, longitude);
        setWeatherData(data);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Không thể lấy thông tin thời tiết. Vui lòng kiểm tra kết nối và cho phép quyền truy cập vị trí.');
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      getWeather();
    } else {
      setError('Trình duyệt không hỗ trợ định vị địa lý');
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const data = await fetchWeatherData(latitude, longitude);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    const iconMap = {
      0: '☀️',
      1: '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌦️',
      55: '🌧️',
      61: '🌧️',
      63: '🌧️',
      65: '⛈️',
      71: '❄️',
      73: '❄️',
      75: '❄️',
      80: '🌦️',
      81: '🌦️',
      82: '⛈️',
      85: '🌨️',
      86: '🌨️',
      95: '⛈️',
      96: '⛈️',
      99: '⛈️',
    };
    
    return iconMap[code] || '🌡️';
  };

  const getTemperatureColor = (temp) => {
    if (temp <= 0) return '#4dabf7';
    if (temp <= 10) return '#74c0fc';
    if (temp <= 25) return '#40c057';
    if (temp <= 35) return '#ff922b';
    return '#fa5252';
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <div id="comWeather-container" className="comWeather-container">
        <div id="comWeather-loading" className="comWeather-loading">
          <div className="comWeather-spinner"></div>
          <p>Đang tải dữ liệu thời tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="comWeather-container" className="comWeather-container">
        <div id="comWeather-error" className="comWeather-error">
          <p>⚠️ {error}</p>
          <button 
            id="comWeather-retry-btn"
            className="comWeather-retry-btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  // Component thu nhỏ (Compact view)
  if (!isExpanded) {
    return (
      <div id="comWeather-container" className="comWeather-container">
        <div id="comWeather-card" className="comWeather-card comWeather-card-compact">
          <div id="comWeather-compact-header" className="comWeather-compact-header">
            <button 
              id="comWeather-expand-btn"
              className="comWeather-toggle-btn"
              onClick={toggleExpand}
              title="Mở rộng"
            >
              ⬇️
            </button>
            <div id="comWeather-compact-location" className="comWeather-compact-location">
              <span>📍</span>
              <span id="comWeather-compact-location-text" className="comWeather-compact-location-text">
                {location ? location.split(',')[0] : 'Vị trí hiện tại'}
              </span>
            </div>
          </div>

          <div id="comWeather-compact-content" className="comWeather-compact-content">
            <div id="comWeather-compact-main" className="comWeather-compact-main">
              <span id="comWeather-compact-icon" className="comWeather-compact-icon">
                {getWeatherIcon(weatherData.weatherCode)}
              </span>
              <span 
                id="comWeather-compact-temp"
                className="comWeather-compact-temp"
                style={{ color: getTemperatureColor(weatherData.temperature) }}
              >
                {Math.round(weatherData.temperature)}°C
              </span>
              <span id="comWeather-compact-desc" className="comWeather-compact-desc">
                {weatherData.description}
              </span>
            </div>

            <div id="comWeather-compact-footer" className="comWeather-compact-footer">
              <button 
                id="comWeather-compact-refresh"
                className="comWeather-compact-refresh"
                onClick={handleRefresh}
                title="Làm mới"
              >
                🔄
              </button>
              {lastUpdated && (
                <span id="comWeather-compact-time" className="comWeather-compact-time">
                  {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Component phóng to (Expanded view)
  return (
    <div id="comWeather-container" className="comWeather-container">
      <div id="comWeather-card" className="comWeather-card comWeather-card-expanded">
        <div id="comWeather-header" className="comWeather-header">
          <div className="comWeather-header-top">
            <h2 id="comWeather-title" className="comWeather-title">
              Thời tiết hiện tại
            </h2>
            <button 
              id="comWeather-collapse-btn"
              className="comWeather-toggle-btn"
              onClick={toggleExpand}
              title="Thu nhỏ"
            >
              ⬆️
            </button>
          </div>
          
          {location && (
            <p id="comWeather-location" className="comWeather-location">
              📍 {location}
            </p>
          )}
        </div>

        <div id="comWeather-content" className="comWeather-content">
          <div id="comWeather-main" className="comWeather-main">
            <div id="comWeather-temp" className="comWeather-temp">
              <span 
                id="comWeather-temp-value"
                className="comWeather-temp-value"
                style={{ color: getTemperatureColor(weatherData.temperature) }}
              >
                {Math.round(weatherData.temperature)}°C
              </span>
              <span id="comWeather-icon" className="comWeather-icon">
                {getWeatherIcon(weatherData.weatherCode)}
              </span>
            </div>
            <p id="comWeather-description" className="comWeather-description">
              {weatherData.description}
            </p>
          </div>

          <div id="comWeather-details" className="comWeather-details">
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">🌡️ Cảm giác như</span>
              <span id="comWeather-apparent-temp" className="comWeather-detail-value">
                {Math.round(weatherData.apparentTemperature)}°C
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">💧 Độ ẩm</span>
              <span id="comWeather-humidity" className="comWeather-detail-value">
                {weatherData.humidity}%
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">💨 Tốc độ gió</span>
              <span id="comWeather-wind-speed" className="comWeather-detail-value">
                {Math.round(weatherData.windSpeed)} km/h
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">🧭 Hướng gió</span>
              <span id="comWeather-wind-direction" className="comWeather-detail-value">
                {weatherData.windDirection}°
              </span>
            </div>
          </div>
        </div>

        <div id="comWeather-footer" className="comWeather-footer">
          <div className="comWeather-footer-left">
            {lastUpdated && (
              <p id="comWeather-updated" className="comWeather-updated">
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          
          <div className="comWeather-footer-right">
            <button 
              id="comWeather-refresh-btn"
              className="comWeather-refresh-btn"
              onClick={handleRefresh}
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentWeather;