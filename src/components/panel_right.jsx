import React from 'react';
import '../css/panel_right.css';
import ComponentWeather from './componentWeather';
import ComponentGoldPrice from './componentGoldPrice';
const RightPanel = () => {
  

  return (
    <aside className="right-panel">
      <div>
        <ComponentWeather />
      </div>
      
    </aside>
  );
};

export default RightPanel;