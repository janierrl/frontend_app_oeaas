import React, { useState } from "react";
import { Row, Col, Button, Badge } from "antd";
import { useReactMediaRecorder } from "react-media-recorder";
import Text from "antd/lib/typography/Text";
import io from "socket.io-client";
import {useEffect} from "react"
const socket = io.connect("http://localhost:3001");

const ScreenRecording = ({
  screen,
  audio,
  video,
  downloadRecordingPath,
  downloadRecordingType,
  emailToSupport
  
}) => {

  const [recordingNumber, setRecordingNumber] = useState(0);
  
 

 
  
  
  
  
  const RecordView = () => {
    const {
      status,
      pauseRecording:pauseRecord,
      resumeRecording:resumeRecord,
      startRecording: startRecord,
      stopRecording: stopRecord,
      mediaBlobUrl
      
    } = useReactMediaRecorder({ screen:true});
    
   
const startRecording = () => {
      return startRecord();
};
const pauseRecording = () => {
  return pauseRecord();
};
const resumeRecording = () => {
  return resumeRecord();
};
const stopRecording = () => {
      const currentTimeSatmp = new Date().getTime();
      setRecordingNumber(currentTimeSatmp);
      return stopRecord();
    };
const viewRecording = () => {
      window.open(mediaBlobUrl, "_blank").focus();
    };
const downloadRecording = () => {
      const pathName = `${downloadRecordingPath}_${recordingNumber}.${downloadRecordingType}`;
      try {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(mediaBlobUrl, pathName);
      } else {
        // for Chrome
        const link = document.createElement("a");
        link.href = mediaBlobUrl;
        link.download = pathName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      } catch (err) {
        console.error(err);
      }
};
downloadRecordingType && mediaBlobUrl  && status === "stopped" && (
      <Button
        size="small"
        onClick={downloadRecording}
        type="primary"
        className="downloadRecording margin-left-sm"
      >
      Descargar
      </Button>
)
const mailRecording = () => {
      try {
        window.location.href = `mailTo:${emailToSupport}?subject=Screen recording for an Issue number ${recordingNumber}&body=Hello%20Team,%0D%0A%0D%0A${mediaBlobUrl}`;
      } catch (err) {
        console.error(err);
      }
    };
    
  useEffect(()=>{
    socket.on("start",()=>{
      console.log("empezado");
      startRecording();
    })
    socket.on("pausar",()=>{
      console.log("pausado");
      pauseRecording();
    })
    socket.on("continuar",()=>{
      console.log("renaudado");
      resumeRecording();
    })
    socket.on("stop",()=>{
      console.log("stop");
      stopRecording();
    })
    socket.on("stream",()=>{
      console.log("descargado");
      downloadRecording();
    })
  })
  
return (
      <Row>
        <Col span="12" style={{ lineHeight: "24px" }}>
          {status && status !== "stopped" && (
            <Text>
              Grabación de pantalla Estado: {status && status.toUpperCase()}
            </Text>
          )}
          {status && status === "recording" && (
            <Badge
              className="screen-recording-badge"
              color="#faad14"
              status="processing"
              offset={[2, 0]}
              style={{
                marginLeft: "5px"
              }}
            />
          )}
        </Col>
        <Col span="12" style={{ textAlign: "right" }}>
          {status && status !== "recording" && (
            <Button
              size="small"
              onClick={startRecording}
              type="primary"
              className="margin-left-sm"
              ghost
            >
              {mediaBlobUrl ? "Grabar de nuevo" : "Comenzar grabación"}
            </Button>
          )}
          {status && status === "recording" && (
            <Button
              size="small"
              onClick={stopRecording}
              type="danger"
              className="margin-left-sm"
              ghost
            >
              Detener
            </Button>
          )}
          {status && status === "recording" && (
            <Button
              size="small"
              onClick={pauseRecording}
              type="danger"
              className="margin-left-sm"
              ghost
            >
              Pausar
            </Button>
          )}
          {status && status === "paused" && (
            <Button
              size="small"
              onClick={resumeRecording}
              type="danger"
              className="margin-left-sm"
              ghost
            >
              Continuar
            </Button>
          )}
          {mediaBlobUrl  && status === "stopped" && (
            <Button
              size="small"
              onClick={viewRecording}
              type="primary"
              className="viewRecording margin-left-sm"
            >
              Ver
            </Button>
          )}
          {
            mediaBlobUrl &&
            status &&
            status === "stopped" && (
              <Button
                size="small"
                onClick={downloadRecording}
                type="primary"
                className="downloadRecording margin-left-sm"
              >
                Descargar
              </Button>
            )}
          {emailToSupport && mediaBlobUrl && status && status === "stopped" && (
            <Button
              size="small"
              onClick={mailRecording}
              type="primary"
              className="mailRecording margin-left-sm"
            >
              Enviar por Correo
            </Button>
          )}
        </Col>
      </Row>
    );
  };
return (
    <div className="Scren-Record-Wrapper" style={{ padding: "5px 20px" }}>
      {RecordView()}
    </div>
  );
};
export default ScreenRecording;