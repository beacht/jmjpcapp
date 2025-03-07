import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import JMJButton from './JMJButton';

const Chatbox = () => {
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
      read: null,
      sentOn: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      setNewMessage('');
      fetchMessages();
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
    <div className="bg-JMJ w-[95%] md:w-[40%] h-min max-h-[300px] rounded-lg flex flex-col items-center">
      <div className="w-full flex flex-col overflow-y-auto max-h-[300px]">
        {messages.length > 0 ? (
          messages
            .sort((b, a) => b.sentOn.seconds - a.sentOn.seconds)
            .map((message) => {
              const timestamp = new Date(message.sentOn.seconds * 1000).toLocaleString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' }) + " " + new Date(message.sentOn.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
              
              return (
                <div 
                  key={message.id} 
                  className={`text-white ${message.fromClient ? "text-right mr-3" : "text-left ml-3"} flex items-center`}
                  title={`${timestamp} from ${message.fromClient ? client.firstName + " " + client.lastName : "JMJPC"}`}
                >
                  {!message.fromClient && (
                    <img 
                      src="/DoctorHeadshot.png"
                      alt="JMJPC Profile"
                      className="w-8 h-8 rounded-full mr-2 object-center"
                    />
                  )}
                  <div 
                    className={`w-max rounded-lg p-3 m-2 ${message.fromClient ? "bg-blue-500 ml-auto" : "bg-gray-400"}`}
                  >
                    {message.content}
                  </div>
                </div>
              );              
            })
        ) : (
          <p className='text-white font-bold text-center mt-4'>No message history.</p>
        )}
      </div>
      <div className="flex justify-center items-start w-full gap-[2%] mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message JMJ Pregnancy Center"
          className="p-2 rounded-lg mx-2 mb-4 w-[80%] text-center"
        />
        <JMJButton onClick={handleSendMessage} text="Send" className="mx-2"/>
      </div>
    </div>
  );
};

export default Chatbox;
