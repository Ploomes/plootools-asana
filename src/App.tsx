import React, { useEffect } from 'react';
import { STATE_GLOBAL } from './constants';
import Routes from './routes';

function App() {
  useEffect(()=>{
    chrome.storage.local.set({
      states: STATE_GLOBAL
    });
  }, []);
  return (
    <div className="App">
      <Routes />
    </div>
  );
}

export default App;
