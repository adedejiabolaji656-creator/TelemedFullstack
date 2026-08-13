import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [myStream, setMyStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peerCount, setPeerCount] = useState(0);

  const myVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef([]);
  const remoteVideosRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect_error', () => {
      alert('Unable to connect to the video server.');
    });

    const addRemoteVideo = (userId) => {
      const existing = remoteVideosRef.current.find((v) => v.userId === userId);
      if (existing) return;
      const videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.className = 'w-full h-full object-cover rounded-xl';
      remoteVideosRef.current.push({ userId, element: videoEl });
      setPeerCount(remoteVideosRef.current.length);
    };

    const removeRemoteVideo = (userId) => {
      remoteVideosRef.current = remoteVideosRef.current.filter((v) => v.userId !== userId);
      setPeerCount(remoteVideosRef.current.length);
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        socket.emit('video:join', { roomId });

        socket.on('video:peerJoined', ({ userId }) => {
          addRemoteVideo(userId);
          const peer = new Peer({ initiator: true, trickle: false, stream });
          peer.on('signal', (data) => socket.emit('video:signal', { roomId, data }));
          peer.on('stream', (remoteStream) => {
            const entry = remoteVideosRef.current.find((v) => v.userId === userId);
            if (entry) entry.element.srcObject = remoteStream;
          });
          peer.on('error', () => peer.destroy());
          peersRef.current.push({ userId, peer });
        });

        socket.on('video:signal', ({ userId, data }) => {
          const existing = peersRef.current.find((p) => p.userId === userId);
          if (existing) {
            existing.peer.signal(data);
          } else {
            addRemoteVideo(userId);
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on('signal', (sig) => socket.emit('video:signal', { roomId, data: sig }));
            peer.on('stream', (remoteStream) => {
              const entry = remoteVideosRef.current.find((v) => v.userId === userId);
              if (entry) entry.element.srcObject = remoteStream;
            });
            peer.on('error', () => peer.destroy());
            peer.signal(data);
            peersRef.current.push({ userId, peer });
          }
        });

        socket.on('video:peerLeft', ({ userId }) => {
          const idx = peersRef.current.findIndex((p) => p.userId === userId);
          if (idx !== -1) {
            peersRef.current[idx].peer.destroy();
            peersRef.current.splice(idx, 1);
          }
          removeRemoteVideo(userId);
        });
      })
      .catch(() => {
        alert('Unable to access camera or microphone. Please allow permissions.');
        navigate(-1);
      });

    return () => {
      socket.emit('video:leave', { roomId });
      socket.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach(({ peer }) => peer.destroy());
      remoteVideosRef.current = [];
    };
  }, [roomId, navigate]);

  const toggleMic = () => {
    setMicOn((prev) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !prev));
      return !prev;
    });
  };

  const toggleCam = () => {
    setCamOn((prev) => {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !prev));
      return !prev;
    });
  };

  const hangUp = () => {
    socketRef.current?.emit('video:leave', { roomId });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peersRef.current.forEach(({ peer }) => peer.destroy());
    navigate('/appointments');
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 text-white">
        <div>
          <h1 className="font-semibold">Video Consultation</h1>
          <p className="text-sm text-gray-400 flex items-center">
            <Users size={14} className="mr-1" /> {peerCount + 1} participant(s) in room
          </p>
        </div>
        <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full animate-pulse">
          LIVE
        </span>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid gap-4 h-full ${peerCount > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Self view */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden">
            {myStream ? (
              <video ref={myVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Loading camera...</div>
            )}
            <span className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg">
              You {!camOn && '· camera off'}
            </span>
          </div>

          {/* Remote views */}
          {remoteVideosRef.current.map(({ userId, element }) => (
            <div key={userId} className="relative bg-gray-800 rounded-xl overflow-hidden">
              <div ref={(node) => node && node.appendChild(element)} className="w-full h-full" />
              <span className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg">
                Participant
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-5 bg-gray-900">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${micOn ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-red-500 text-white'}`}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition-colors ${camOn ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-red-500 text-white'}`}
          title={camOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          onClick={hangUp}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          title="End call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
