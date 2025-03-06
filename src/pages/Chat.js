import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const Chat = () => {
  const { client } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const messagesQuerySnapshot = await getDocs(collection(db, "messages"));
      
      const clientMessages = messagesQuerySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(message => message.client === client?.id);

      setMessages(clientMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !client) return;

    const messageData = {
      client: client.id,
      content: newMessage.trim(),
      fromClient: true,
      read: null, // or leave it undefined if you want it unset
      sentOn: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      setNewMessage('');
      fetchMessages(); // Refresh the messages list after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (client) {
      fetchMessages();
    }
  }, [client]);

  return (
    <div>
      <h1>Messages for {client?.firstName}</h1>
      <div>
        {messages.length > 0 ? (
          messages
            .sort((a, b) => b.sentOn.seconds - a.sentOn.seconds)
            .map((message) => (
              <div key={message.id}>
                <strong>
                  {message.fromClient 
                    ? `${client.firstName} ${client.lastName}` 
                    : "JMJPC"
                  }: 
                </strong>
                {" "}{message.content} {"[" + new Date(message.sentOn.seconds * 1000).toLocaleString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' }) + " " + new Date(message.sentOn.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + "]"}
              </div>
            ))
        ) : (
          <p>No messages available</p>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ padding: '8px', width: '70%', marginRight: '10px' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '8px 16px' }}>
          Send
        </button>
      </div>
    </div>
  );  
};

export default Chat;
