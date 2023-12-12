import React, { useEffect } from 'react';
import { Container } from './styles/Components';
import { STATE_GLOBAL } from './constants';
import Form from './components/Form';

function App() {
  useEffect(()=>{
    chrome.storage.local.set({
      states: STATE_GLOBAL
    });
  }, []);
  return (
    <div className="App">
      <Container className='center-flex'>
        <Form />
      </Container>
    </div>
  );
}

export default App;
