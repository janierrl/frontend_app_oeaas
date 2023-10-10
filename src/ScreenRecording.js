import React, { useState, useCallback, useRef } from "react";
import { Row, Col, Button, Badge, Space } from "antd";
import { useReactMediaRecorder } from "react-media-recorder";
import Text from "antd/lib/typography/Text";
import io from "socket.io-client";
import { useEffect } from "react";
import axios from "axios";
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  PauseCircleOutlined, 
  StepForwardOutlined, 
  PictureOutlined,
  CloudUploadOutlined,
  MailOutlined
} from '@ant-design/icons';
const socket = io.connect("http://localhost:3001");

const ScreenRecording = ({
  screen,
  audio,
  video,
  downloadRecordingPath,
  downloadRecordingType,
  emailToSupport,
}) => {
  const [recordingNumber, setRecordingNumber] = useState(0);
  const [blob, setBlob] = useState(0);
  const blobRef = useRef(blob);
  const videoRef = useRef(null);

  const RecordView = () => {
    const {
      status,
      pauseRecording: pauseRecord,
      resumeRecording: resumeRecord,
      startRecording: startRecord,
      stopRecording: stopRecord,
      mediaBlobUrl,
    } = useReactMediaRecorder({
      screen: screen,
      audio: audio,
      video: video,
      onStop: (blobUrl, blob) => {
        setBlob(blob);
        blobRef.current = blob;
      },
    });

    const startRecording = useCallback(() => {
      return startRecord();
    }, [startRecord]);

    const pauseRecording = useCallback(() => {
      return pauseRecord();
    }, [pauseRecord]);

    const resumeRecording = useCallback(() => {
      return resumeRecord();
    }, [resumeRecord]);

    const stopRecording = useCallback(() => {
      const currentTimeSatmp = new Date().getTime();
      
      setRecordingNumber(currentTimeSatmp);
      return stopRecord();
    }, [stopRecord]);

    const viewRecording = () => {
      window.open(mediaBlobUrl, "_blank").focus();
    };

    const captureFrame = () => {
      return new Promise((resolve, reject) => {
        if (videoRef.current) {
          const video = videoRef.current;
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/png");
        } else {
          reject(new Error("Video element not found."));
        }
      });
    };

    const downloadRecording = useCallback(async (data) => {
      try {
        const image = await captureFrame();
        const detailsScreen = {
          nameScreen: data.nameScreen,
          startDate: data.startDate,
          endDate: data.endDate,
          nameConsultancy: data.nameConsultancy
        };
        const detailsConsultancy = {
          nameConsultancy: data.nameConsultancy,
          startDateConsultancy: data.startDateConsultancy,
          endDateConsultancy: data.endDateConsultancy,
          author: data.author,
          entity: data.entity, 
          ueb: data.ueb, 
          unit: data.unit, 
          area: data.area, 
          process: data.process, 
          worker: data.worker,
          observationType: data.observationType,
          view: data.view,
          collaborators: data.collaborators,
          goals: data.goals
        };
        const pathName = `screen.${downloadRecordingType}`;
        const formattedJSONScreen = JSON.stringify(detailsScreen, null, 2);
        const formattedJSONConsultancy = JSON.stringify(detailsConsultancy, null, 2);
        const formData = new FormData();

        formData.append("video", blobRef.current, pathName);
        formData.append("json_screen", new Blob([formattedJSONScreen], { type: "application/json" }), `info.json`);
        formData.append("json_consultancy", new Blob([formattedJSONConsultancy], { type: "application/json" }), `info.json`);
        formData.append("thumbnail", image, `thumbnail.png`);
    
        await axios.post("http://localhost:3002/files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (err) {
        console.error(err);
      }
    }, []);

    downloadRecordingType && mediaBlobUrl && status === "stopped" && (
      <Button
        size="small"
        onClick={downloadRecording}
        type="primary"
        className="downloadRecording margin-left-sm"
      >
        Descargar
      </Button>
    );

    const mailRecording = () => {
      try {
        window.location.href = `mailTo:${emailToSupport}?subject=Screen recording for an Issue number ${recordingNumber}&body=Hello%20Team,%0D%0A%0D%0A${mediaBlobUrl}`;
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
      if (status === 'recording') {
        socket.emit("started");
      } else if (status === 'paused') {
        socket.emit("paused");
      } else if (status === 'stopped') {
        socket.emit("stopped");
      }
    }, [status]);
  
    useEffect(() => {
      const startRecordingListener = () => startRecording();
      const pauseRecordingListener = () => pauseRecording();
      const resumeRecordingListener = () => resumeRecording();
      const stopRecordingListener = () => stopRecording();
      const uploadRecordingListener = (data) => {
        downloadRecording(data);
      };

      socket.on("start_recording", startRecordingListener);
      socket.on("pausar_recording", pauseRecordingListener);
      socket.on("continuar_recording", resumeRecordingListener);
      socket.on("stop_recording", stopRecordingListener);
      socket.on("upload_recording", uploadRecordingListener);
  
      return () => {
        socket.off("start_recording", startRecordingListener);
        socket.off("pausar_recording", pauseRecordingListener);
        socket.off("continuar_recording", resumeRecordingListener);
        socket.off("stop_recording", stopRecordingListener);
        socket.off("upload_recording", uploadRecordingListener);
      };
    }, [startRecording, pauseRecording, resumeRecording, stopRecording, downloadRecording]);

    return (
      <Row>
        <Col span="12" style={{ lineHeight: "24px" }}>
          {status && status !== "stopped" && (
            <Text>
              Estado: {status && status.toUpperCase()}
            </Text>
          )}
          {status && status === "recording" && (
            <Badge
              color="#faad14"
              status="processing"
              offset={[2, 0]}
              style={{
                marginLeft: "5px",
              }}
            />
          )}
        </Col>
        <Col span="12" style={{ textAlign: "right" }}>
          <Space wrap>
            {status && status !== "recording" && (
              <Button
                size="small"
                onClick={startRecording}
                type="primary"
                icon={<PlayCircleOutlined />}
                ghost
              >
                {mediaBlobUrl ? "Grabar de nuevo" : "Comenzar grabación"}
              </Button>
            )}
            {status && status === "recording" && (
              <Button
                size="small"
                onClick={stopRecording}
                type="primary"
                icon={<StopOutlined />}
                danger
                ghost
              >
                Detener
              </Button>
            )}
            {status && status === "recording" && (
              <Button 
                size="small" 
                onClick={pauseRecording} 
                type="primary"
                icon={<PauseCircleOutlined />}
                danger
              >
                Pausar
              </Button>
            )}
            {status && status === "paused" && (
              <Button
                size="small"
                onClick={resumeRecording}
                type="primary"
                icon={<StepForwardOutlined />}
              >
                Continuar
              </Button>
            )}
            {mediaBlobUrl && status === "stopped" && (
              <Button 
                size="small" 
                onClick={viewRecording} 
                type="primary"
                icon={<PictureOutlined />}
              >
                Ver
              </Button>
            )}
            {mediaBlobUrl && status && status === "stopped" && (
              <Button 
                size="small" 
                onClick={downloadRecording} 
                type="primary"
                icon={<CloudUploadOutlined />}
              >
                Subir a la nube
              </Button>
            )}
            {emailToSupport &&
              mediaBlobUrl &&
              status &&
              status === "stopped" && (
                <Button
                  size="small" 
                  onClick={mailRecording} 
                  type="primary"
                  icon={<MailOutlined />}
                >
                  Enviar por Correo
                </Button>
              )}
            {mediaBlobUrl && status === "stopped" && (
              <video ref={videoRef} src={mediaBlobUrl}  controls />
            )}
          </Space>
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
