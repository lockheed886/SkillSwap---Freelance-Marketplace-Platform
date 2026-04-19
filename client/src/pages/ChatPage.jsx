import React from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/messaging/ChatWindow';
import { useLocation } from 'react-router-dom';

// expects `state` from Link: { partner: { _id, name, projectId? } }
export default function ChatPage() {
  const { conversationId } = useParams();
  const { state } = useLocation();
  const partner = state?.partner;

  if (!partner) {
    return <p className="p-4 text-center text-red-600">
      Invalid chat. No partner data provided.
    </p>;
  }

  return (
    <div className="h-screen max-w-3xl mx-auto py-8">
      <ChatWindow conversationId={conversationId} partner={partner} />
    </div>
  );
}
