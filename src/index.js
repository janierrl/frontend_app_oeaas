import React from 'react';
import ReactDOM from 'react-dom/client';


import reportWebVitals from './reportWebVitals';
import ScreenRecording from './ScreenRecording';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  
  <ScreenRecording
    screen={true}
    audio={true}
    video={true}
    downloadRecordingPath="Captura"
    downloadRecordingType=".mp4"
    emailToSupport="support@xyz.com"
  ></ScreenRecording>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
