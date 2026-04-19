import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';
import { formatDate } from '../../utils/displayHelpers.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

export default function ChatWindow({ conversationId, partner }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const socketRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('joinConversation', conversationId);

    socketRef.current.on('new_message', msg => {
      setMessages(prev => [...prev, msg]);
    });
    socketRef.current.on('messages_read', ({ conversationId: convId }) => {
      if (convId === conversationId) {
        setMessages(prev => prev.map(m =>
          m.receiverId === user._id ? {...m, readStatus: true} : m
        ));
      }
    });

    return () => {
      socketRef.current.emit('leaveConversation', conversationId);
      socketRef.current.disconnect();
    };
  }, [conversationId, user._id]);

  useEffect(() => {
    (async () => {
      const msgs = await messageService.getMessages(conversationId);
      setMessages(msgs);
      // mark unread as read
      await messageService.markRead(conversationId);
    })();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    await messageService.sendMessage(conversationId, {
      receiverId: partner._id,
      projectId: partner.projectId,
      content: content.trim()
    });
    setContent('');
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="px-4 py-2 bg-gray-100 border-b">
        <strong>Chat with {partner.name}</strong>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`max-w-xs ${msg.senderId === user._id ? 'ml-auto bg-indigo-100' : 'mr-auto bg-gray-100'} p-2 rounded`}
          >
            <p className="text-sm">{msg.content}</p>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{formatDate(msg.createdAt)}</span>
              {msg.senderId === user._id && msg.readStatus && <span>✓✓</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex space-x-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 rounded disabled:opacity-50"
          disabled={!content.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
