import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Chat = () => {
  const { client } = useAuth();
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const messagesQuerySnapshot = await getDocs(collection(db, "messages"));
      
      const clientMessages = messagesQuerySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(message => message.client === client?.id);

      console.log(clientMessages);
      setMessages(clientMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
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
            .sort((a, b) => b.sentOn.seconds - a.sentOn.seconds) // Sort by sentOn timestamp in descending order
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
    </div>
  );  
};

export default Chat;
