import { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ sessionId }: { sessionId: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8080`);
        setWs(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "sync" && videoRef.current) {
                videoRef.current.currentTime = data.timestamp;
                if (data.isPlaying) videoRef.current.play();
                else videoRef.current.pause();
            }
        };

        return () => socket.close();
    }, [sessionId]);

    const handleSync = () => {
        if (ws && videoRef.current) {
            ws.send(JSON.stringify({ type: "sync", timestamp: videoRef.current.currentTime, isPlaying: !videoRef.current.paused }));
        }
    };

    return (
        <div>
            <video ref={videoRef} src="video.mp4" controls onPlay={handleSync} onPause={handleSync} onTimeUpdate={handleSync} />
        </div>
    );
};

export default VideoPlayer;
