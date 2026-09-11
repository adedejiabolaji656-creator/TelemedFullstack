import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Volume2,
  Wifi,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myStream, setMyStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [audioOnly, setAudioOnly] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [connectionState, setConnectionState] = useState('connecting');

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
      setConnectionState('unavailable');
      alert('Unable to connect to the consultation server.');
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
      .getUserMedia({ video: !audioOnly, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        socket.emit('video:join', { roomId });
        setConnectionState('connected');

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
        alert(
          audioOnly
            ? 'Unable to access your microphone. Please allow permissions.'
            : 'Unable to access camera or microphone. Please allow permissions.'
        );
        navigate(-1);
      });

    return () => {
      socket.emit('video:leave', { roomId });
      socket.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach(({ peer }) => peer.destroy());
      remoteVideosRef.current = [];
    };
  }, [roomId, navigate, audioOnly]);

  const toggleMic = () => {
    setMicOn((prev) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !prev));
      return !prev;
    });
  };

  const addVideoTrack = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = videoStream.getVideoTracks()[0];
      streamRef.current?.addTrack(track);
      if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
      setCamOn(true);
      setAudioOnly(false);
    } catch (e) {
      alert('Unable to start your camera.');
    }
  };

  const removeVideoTrack = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.stop();
      streamRef.current.removeTrack(t);
    });
    if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
    setCamOn(false);
    setAudioOnly(true);
  };

  const toggleCam = () => {
    if (audioOnly || !camOn) {
      addVideoTrack();
    } else {
      removeVideoTrack();
    }
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
          <h1 className="font-semibold">Consultation Room</h1>
          <p className="text-sm text-gray-400 flex items-center">
            <Users size={14} className="mr-1" /> {peerCount + 1} participant(s) ·{' '}
            {audioOnly ? 'audio only' : 'video call'}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
            connectionState === 'connected'
              ? 'bg-emerald-500/20 text-emerald-300 animate-pulse'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {connectionState === 'connected' ? (
            <>
              <Wifi size={12} /> LIVE
            </>
          ) : (
            <>
              <Loader2 size={12} className="animate-spin" /> CONNECTING
            </>
          )}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div
          className={`grid gap-4 h-full ${peerCount > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
        >
          {/* Self view */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden">
            {myStream && ((camOn && myVideoRef.current) || audioOnly) ? (
              <>
                <video ref={myVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!camOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Volume2 className="mx-auto mb-2" size={28} />
                      <p className="text-sm">Camera off — audio only</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Loading camera...
              </div>
            )}
            <span className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg">
              You · {user?.role} {!camOn && '· camera off'}
            </span>
          </div>

          {/* Remote views */}
          {remoteVideosRef.current.map(({ userId, element }) => (
            <div key={userId} className="relative bg-gray-800 rounded-xl overflow-hidden">
              <div ref={(node) => node && node.appendChild(element)} className="w-full h-full" />
              <span className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg">
                Doctor
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
          title={camOn ? 'Turn off camera (audio only)' : 'Turn on camera'}
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

      {user?.role === 'doctor' && (
        <p className="pb-3 text-center text-xs text-gray-500">
          After the call use the Appointment action buttons to write notes, prescribe, request
          labs or schedule a follow-up.
        </p>
      )}
    </div>
  );
};

export default VideoCall;