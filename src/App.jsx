import React from 'react';
import TopPanel from './components/TopPanel';
import BottomPanel from './components/BottomPanel';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
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