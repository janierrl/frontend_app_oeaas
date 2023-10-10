import React from "react";
import ReactDOM from "react-dom/client";
import ScreenRecording from "./ScreenRecording";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ScreenRecording
      screen={true}
      audio={true}
      video={true}
      downloadRecordingType="mp4"
      emailToSupport="consultoriaservice.aica@gmail.com"
    ></ScreenRecording>
  </React.StrictMode>
);
