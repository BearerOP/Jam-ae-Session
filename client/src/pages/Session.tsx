import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { addVideoToQueue, getQueue } from "../utils/api";
import { SessionQueue } from "../types/user";

// interface QueueResponse {
//     data: SessionQueue[];
// }

const Session: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [queue, setQueue] = useState<SessionQueue[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;
  
    const fetchQueue = async () => {
      try {
        console.log(sessionId, "sessionId");
        const { data } = await getQueue(sessionId);
        console.log(data, "data");
  
        setQueue(data as SessionQueue[]); // Ensure correct type assignment
      } catch (error) {
        console.error("Failed to fetch queue:", error);
      }
    };
  
    fetchQueue();
  
    // Setup WebSocket connection
    socket.current = new WebSocket(
      `ws://localhost:8080`
    );
  
    socket.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("Received WebSocket message:", data);
  
      if (data.event === "queue_updated") {
        setQueue(data.data.queue);
      } else if (data.event === "play_video") {
        setCurrentVideo(data.data.url);
      } else if (data.event === "sync_time") {
        if (videoRef.current) {
          videoRef.current.currentTime = data.data.time;
        }
      }
    };
  
    return () => {
      socket.current?.close();
    };
  }, [sessionId]);
   // Removed `queue` to prevent unnecessary socket reconnections

   const handleAddVideo = async () => {
    if (!sessionId || !newVideoUrl.trim()) return;
  
    try {
      socket.current?.send(
        JSON.stringify({
          event: "add_to_queue",
          data: { sessionId, youtubeUrl: newVideoUrl },
        })
      );
      console.log("Requested to add video to queue");
  
      setNewVideoUrl("");
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };
  

  const handlePlayVideo = (url: string) => {
    setCurrentVideo(url);
    socket.current?.send(
      JSON.stringify({ event: "PLAY_VIDEO", data: { url } })
    );
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      socket.current?.send(
        JSON.stringify({
          event: "SYNC_TIME",
          data: { time: videoRef.current.currentTime },
        })
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Session {sessionId}</h2>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={newVideoUrl}
        onChange={(e) => setNewVideoUrl(e.target.value)}
        className="p-2 border rounded w-full"
      />
      <button
        onClick={handleAddVideo}
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
      >
        Add to Queue
      </button>

      {currentVideo && (
        <video
          ref={videoRef}
          src={currentVideo}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="w-full"
        />
      )}

      <h3 className="text-xl font-bold mt-4">Queue:</h3>
      <ul>
        {queue.map((video, index) => (
          <li
            key={index}
            className="cursor-pointer text-blue-500 underline"
            onClick={() => handlePlayVideo(video.youtubeUrl)}
          >
            {video.youtubeUrl}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Session;
