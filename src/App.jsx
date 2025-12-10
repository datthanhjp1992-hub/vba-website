import React from 'react';
import TopPanel from './components/panel_top';
import BottomPanel from './components/panel_bottom';
import LeftPanel from './components/panel_left';
import CenterPanel from './components/panel_center';
import RightPanel from './components/panel_right';
import './css/App.css';

function App() {
  return (
    <div className="app">
      <TopPanel />
      
      <div className="main-container">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      
      <BottomPanel />
    </div>
  );
}

export default App;
