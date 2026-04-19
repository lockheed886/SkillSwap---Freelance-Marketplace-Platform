// client/src/pages/ChatListPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import chatService from '../../services/chatService';

const ChatListPage = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await chatService.getMyConversations();
      setConversations(list);
    })();
  }, []);

  if (!conversations.length) return <p>No conversations yet.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Your Conversations</h1>
      <ul className="space-y-2">
        {conversations.map(c => (
          <li key={c._id}>
            <Link
              to={`/chat/${c._id}`}
              className="text-blue-600 hover:underline"
            >
              {c.partnerName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatListPage;
