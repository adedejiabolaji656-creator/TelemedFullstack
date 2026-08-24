import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, ChevronLeft, MessageSquare } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.emit('appointment:join', { roomId });

    socket.on('chat:newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    axios
      .get(`/api/chat/${roomId}/messages`)
      .then((res) => setMessages(res.data.messages || []))
      .catch((error) => console.error('Error fetching messages:', error))
      .finally(() => setLoading(false));

    return () => {
      socket.close();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    socketRef.current?.emit('chat:message', { roomId, content });
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 text-blue-600" size={24} />
        Live Chat
      </h1>

      <div className="card p-0 overflow-hidden">
        <div className="h-[50vh] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading && <p className="text-center text-gray-400 py-8">Loading messages...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-center text-gray-400 py-8">No messages yet. Say hello!</p>
          )}
          {messages.map((msg, idx) => {
            const isMine = msg.sender?._id === user?._id;
            return (
              <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-medium text-blue-600 mb-1">{msg.sender?.name || 'User'}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex items-center gap-2 p-4 border-t bg-white">
          <input
            type="text"
            className="input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
