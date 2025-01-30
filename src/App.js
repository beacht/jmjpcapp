import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { formatPhoneNumber, formatTime } from './Helpers';

const App = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [closures, setClosures] = useState([]);
  const [locations, setLocations] = useState([]);
  const [messages, setMessages] = useState([]);

  // State for new client form inputs
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    menstrual: '',
    email: '',
    phone: '',
    notes: '',
    language: 'English', // Default language set to English
  });

  // Function to fetch data from Firestore
  const fetchData = async () => {
    try {
      const [appointmentsQuerySnapshot, clientsQuerySnapshot, closuresQuerySnapshot, locationsQuerySnapshot, messagesQuerySnapshot] = await Promise.all([
        getDocs(collection(db, "appointments")),
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "closures")),
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "messages")),
      ]);

      setAppointments(appointmentsQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setClients(clientsQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setClosures(closuresQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLocations(locationsQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setMessages(messagesQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add new client to Firestore
      await addDoc(collection(db, "clients"), {
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        dob: newClient.dob,
        menstrual: newClient.menstrual,
        email: newClient.email,
        phone: newClient.phone,
        notes: newClient.notes,
        language: newClient.language,
        unableToAct: false,
        unableToSchedule: false,
      });

      // Re-fetch data after adding a new client
      await fetchData();

      // Reset form after submission
      setNewClient({
        firstName: '',
        lastName: '',
        dob: '',
        menstrual: '',
        email: '',
        phone: '',
        notes: '',
        language: 'English',
        unableToAct: false,
        unableToSchedule: false,
      });

      alert("New client added successfully!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Error adding client. Please try again.");
    }
  };

  // Handle client deletion
  const handleDelete = async (clientId) => {
    try {
      const clientRef = doc(db, "clients", clientId);
      await deleteDoc(clientRef);

      // Re-fetch data after deleting a client
      await fetchData();

      alert("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error deleting client. Please try again.");
    }
  };

  const getClientById = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client || null;
  };

  const getLocationById = (locationId) => {
    const location = locations.find(location => location.id === locationId);
    return location || null;
  };

  const formatLocationOpenDays = (location) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const openDays = location.daysOpen
      .map((isOpen, index) => isOpen ? daysOfWeek[index] : null)
      .filter(day => day !== null);

    return openDays.join(", ");
  };

  return (
    <div>
      <h1>Firestore Data</h1>

      {/* Clients list */}
      <h2>Clients</h2>
      {clients.map((client, index) => (
        <div key={index}>
          <p><strong>Name:</strong> {client.firstName} {client.lastName}</p>
          <p><strong>Date of Birth:</strong> {client.dob}</p>
          <p><strong>First Day of Last Menstrual Period:</strong> {client.menstrual}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone:</strong> {formatPhoneNumber(client.phone)}</p>
          <p><strong>Client Notes:</strong> {client.notes}</p>
          <p><strong>Language:</strong> {client.language}</p>
          <p><strong>Unable to Schedule:</strong> {client.unableToSchedule ? "TRUE" : "FALSE"}</p>
          <p><strong>Unable to Act:</strong> {client.unableToAct ? "TRUE" : "FALSE"}</p>
          {/* Delete button */}
          <button onClick={() => handleDelete(client.id)}>Delete Client</button>
          <br />
        </div>
      ))}

      {/* New Client Form */}
      <h2>Add a New Client</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={newClient.firstName}
          onChange={handleInputChange}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          value={newClient.lastName}
          onChange={handleInputChange}
          placeholder="Last Name"
          required
        />
        <input
          type="text"
          name="dob"
          value={newClient.dob}
          onChange={handleInputChange}
          placeholder="Date of Birth"
          required
        />
        <input
          type="text"
          name="menstrual"
          value={newClient.menstrual}
          onChange={handleInputChange}
          placeholder="First Day of Last Menstrual Period"
          required
        />
        <input
          type="email"
          name="email"
          value={newClient.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="text"
          name="phone"
          value={newClient.phone}
          onChange={handleInputChange}
          placeholder="Phone Number"
          required
        />
        <textarea
          name="notes"
          value={newClient.notes}
          onChange={handleInputChange}
          placeholder="Client Notes"
        ></textarea>
        <select
          name="language"
          value={newClient.language}
          onChange={handleInputChange}
          required
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
        </select>
        <button type="submit">Add Client</button>
      </form>

      {/* Render Appointments */}
      <h2>Appointments</h2>
      {appointments.map((appointment, index) => {
        const client = getClientById(appointment.client);
        const location = getLocationById(appointment.location);

        return (
          <div key={index}>
            {(client && location) ? (
              <>
                <p><strong>Location: </strong>{location.name}</p>
                <p><strong>Client: </strong>{client.firstName} {client.lastName}</p>
                <p><strong>Date: </strong>{appointment.date}</p>
                <p><strong>Time: </strong>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
                <br />
              </>
            ) : (
              <p>Client and/or location not found</p>
            )}
          </div>
        );
      })}

      {/* Render Closures */}
      <h2>Closures</h2>
      {closures.map((closure, index) => {
        const location = getLocationById(closure.location);

        return (
          <div key={index}>
            {location ? (
              <>
                <p><strong>Location: </strong>{location.name}</p>
                <p><strong>Date: </strong>{closure.date}</p>
                <p><strong>Time: </strong>{formatTime(closure.startTime)} - {formatTime(closure.endTime)}</p>
                <br />
              </>
            ) : (
              <p>Location not found</p>
            )}
          </div>
        );
      })}

      {/* Render Locations */}
      <h2>Locations</h2>
      {locations.map((location, index) => (
        <div key={index}>
          <p><strong>{location.name}:</strong> {location.address}</p>
          <p><strong>Phone:</strong> {formatPhoneNumber(location.phone)}</p>
          <p><strong>Open on:</strong> {formatLocationOpenDays(location)} from {formatTime(location.openTime)} to {formatTime(location.closeTime)}</p>
          <br />
        </div>
      ))}

      {/* Render Messages */}
      <h2>Messages</h2>
      {messages.map((message, index) => {
        const client = getClientById(message.client);

        return (
          <div key={index}>
            {client ? (
              <>
                <p>
                  <strong>{message.fromClient ? "FROM" : "TO"} {client.firstName} {client.lastName}: </strong>
                  {message.content} {"[" + (new Date(message.sentOn.seconds * 1000).toLocaleTimeString("en-US")) + "]"}
                </p>
                <br />
              </>
            ) : (
              <p>Client and/or location not found</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default App;