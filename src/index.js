import React from 'react';
import ReactDOM from 'react-dom/client';
import ScreenRecording from './ScreenRecording';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScreenRecording
      screen={true}
      audio={true}
      video={true}
      downloadRecordingPath="Record"
      downloadRecordingType="mp4"
      emailToSupport="janierrl@yahoo.com"
    ></ScreenRecording>
  </React.StrictMode>
);