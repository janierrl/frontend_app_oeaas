import React, { useState } from "react";
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
      },
    });

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
    const downloadRecording = async () => {
      const pathName = `${downloadRecordingPath}_${recordingNumber}.${downloadRecordingType}`;
      try {
        const formData = new FormData();
        formData.append("video", blob, pathName);

        await axios.post("http://localhost:3002/files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (err) {
        console.error(err);
      }
    };
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
      socket.on("start", () => {
        console.log("empezado");
        startRecording();
      });

      socket.on("pausar", () => {
        console.log("pausado");
        pauseRecording();
      });

      socket.on("continuar", () => {
        console.log("renaudado");
        resumeRecording();
      });

      socket.on("stop", () => {
        console.log("stop");
        stopRecording();
      });

      socket.on("stream", () => {
        console.log("descargado");
        downloadRecording();
      });
    });

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
