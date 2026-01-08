import React, { useState, useEffect } from 'react';
import { fetchMetalPrices, formatPrice, formatNumber, formatSource } from '../services/componentGoldPrice';
import '../css/componentGoldPrice.css';

const ComponentGoldPrice = () => {
  const [prices, setPrices] = useState({
    gold: null,
    silver: null,
    buyGold: null,
    sellGold: null,
    buySilver: null,
    sellSilver: null,
    spreadGold: null,
    spreadSilver: null,
    timestamp: '',
    source: '',
    loading: true,
    error: false,
    retryCount: 0,
    lastUpdate: null
  });

  const loadPrices = async () => {
    setPrices(prev => ({ 
      ...prev, 
      loading: true 
    }));
    
    try {
      const data = await fetchMetalPrices();
      
      setPrices({
        gold: data.gold,
        silver: data.silver,
        buyGold: data.buyGold,
        sellGold: data.sellGold,
        buySilver: data.buySilver,
        sellSilver: data.sellSilver,
        spreadGold: data.spreadGold,
        spreadSilver: data.spreadSilver,
        timestamp: data.timestamp,
        source: data.source,
        loading: false,
        error: data.error || false,
        retryCount: data.error ? prices.retryCount + 1 : 0,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error loading prices:', error);
      setPrices(prev => ({ 
        ...prev, 
        loading: false, 
        error: true,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  useEffect(() => {
    loadPrices();
    
    // Tự động refresh mỗi 30 giây (Swissquote cập nhật real-time)
    const interval = setInterval(loadPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Hiển thị chi tiết giá
  const renderPriceDetails = (metalType) => {
    const isGold = metalType === 'gold';
    const buyPrice = isGold ? prices.buyGold : prices.buySilver;
    const sellPrice = isGold ? prices.sellGold : prices.sellSilver;
    const spread = isGold ? prices.spreadGold : prices.spreadSilver;
    
    if (!buyPrice || !sellPrice) return null;
    
    return (
      <div className="comGoldPriceDetails">
        <div className="comGoldPriceRow">
          <span className="comGoldPriceLabel">Giá mua (Bid):</span>
          <span className="comGoldPriceValue comGoldBuyPrice">
            ${formatNumber(buyPrice)}
          </span>
        </div>
        <div className="comGoldPriceRow">
          <span className="comGoldPriceLabel">Giá bán (Ask):</span>
          <span className="comGoldPriceValue comGoldSellPrice">
            ${formatNumber(sellPrice)}
          </span>
        </div>
        <div className="comGoldPriceRow">
          <span className="comGoldPriceLabel">Chênh lệch (Spread):</span>
          <span className="comGoldPriceValue comGoldSpread">
            ${formatNumber(spread, 3)}
          </span>
        </div>
      </div>
    );
  };

  // Hiển thị thông tin API
  const renderApiInfo = () => (
    <div id="comGoldApiInfo">
      <h4>📡 Thông tin nguồn dữ liệu:</h4>
      <ul>
        <li>
          <strong>Swissquote Forex Feed</strong> - Dữ liệu thời gian thực từ Thụy Sĩ
        </li>
        <li>XAU/USD: Vàng tính bằng USD/ounce</li>
        <li>XAG/USD: Bạc tính bằng USD/ounce</li>
        <li>Auto refresh: 30 giây/lần</li>
        <li>Fallback tự động khi mất kết nối</li>
      </ul>
    </div>
  );

  // Lấy class cho badge nguồn dữ liệu
  const getSourceBadgeClass = () => {
    if (prices.source === 'swissquote') return 'comGoldSourceSwissquote';
    if (prices.error) return 'comGoldSourceFallback';
    return 'comGoldSourceRealtime';
  };

  return (
    <div id="comGoldContainer">
      <div id="comGoldUpdateIndicator">
        {!prices.loading && !prices.error && (
          <>
            <div className="comGoldLiveDot"></div>
            <span>Đang cập nhật...</span>
          </>
        )}
      </div>
      
      <h2 id="comGoldTitle">
        💰 Giá Vàng & Bạc Quốc Tế
        {!prices.loading && (
          <span id="comGoldSourceBadge" className={getSourceBadgeClass()}>
            {formatSource(prices.source).split(' ')[0]}
          </span>
        )}
      </h2>
      
      {prices.loading ? (
        <div id="comGoldLoading">
          <div className="comGoldSpinner"></div>
          <div id="comGoldLoadingText">
            Đang kết nối đến Swissquote...
            {prices.retryCount > 0 && (
              <div style={{ fontSize: '0.9rem', color: '#e67e22', marginTop: '5px' }}>
                Thử lại lần thứ {prices.retryCount + 1}
              </div>
            )}
          </div>
        </div>
      ) : prices.error ? (
        <div id="comGoldError">
          <div id="comGoldErrorIcon">⚠️</div>
          <div id="comGoldErrorMessage">Mất kết nối đến server chính</div>
          <div id="comGoldErrorSubMessage">
            Đang sử dụng dữ liệu dự phòng. Vui lòng thử lại sau.
            <br />
            <small>Thời gian thực có thể bị gián đoạn</small>
          </div>
        </div>
      ) : (
        <>
          <div id="comGoldPricesContainer">
            {/* Gold Price Card */}
            <div className="comGoldPriceCard">
              <div className="comGoldPriceInfo">
                <div className="comGoldMetalName">
                🥇Vàng (XAU/USD) 
                  <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: '#3498db' }}>
                    {prices.source === 'swissquote' ? '🔄 Thời gian thực' : '📊 Tham khảo'}
                  </span>
                </div>
                <div className="comGoldPrice">
                  {formatPrice(prices.gold)}
                </div>
                {renderPriceDetails('gold')}
              </div>
            </div>
            
            {/* Silver Price Card */}
            <div className="comGoldPriceCard">
              <div className="comGoldPriceInfo">
                <div className="comGoldMetalName">
                🥈Bạc (XAG/USD)
                  <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: '#3498db' }}>
                    {prices.source === 'swissquote' ? '🔄 Thời gian thực' : '📊 Tham khảo'}
                  </span>
                </div>
                <div className="comGoldPrice">
                  {formatPrice(prices.silver)}
                </div>
                {renderPriceDetails('silver')}
              </div>
            </div>
          </div>
          
          <div id="comGoldTimestamp">
            <div>
              <strong>Cập nhật lúc:</strong> {prices.timestamp}
            </div>
            {prices.lastUpdate && (
              <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '3px' }}>
                <strong>Nguồn:</strong> {formatSource(prices.source)}
              </div>
            )}
            {prices.error && (
              <div style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '5px' }}>
                ⚠️ Đang sử dụng dữ liệu dự phòng
              </div>
            )}
          </div>
        </>
      )}
      
      <button 
        id="comGoldRefreshButton" 
        onClick={loadPrices}
        disabled={prices.loading}
      >
        {prices.loading ? (
          <>
            <span className="comGoldSpinner" style={{ 
              width: '20px', 
              height: '20px', 
              display: 'inline-block',
              marginRight: '10px',
              borderWidth: '3px'
            }}></span>
            Đang cập nhật...
          </>
        ) : (
          '🔄 Cập nhật ngay'
        )}
        {prices.retryCount > 0 && ` (${prices.retryCount})`}
      </button>
      
    </div>
  );
};

export default ComponentGoldPrice;