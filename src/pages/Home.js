import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import JMJButton from '../components/JMJButton';
import Chatbox from '../components/Chatbox';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { formatTime } from '../helpers/datesAndTimes';
import { getLocationById } from '../helpers/location';
import { updateAppointment } from '../helpers/appointment';

const Home = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [appointmentLocation, setAppointmentLocation] = useState(null);

  const cancelAppointment = async () => {
    if (appointment) {
      try {
        // Call updateAppointment to update the status to 3 (Cancelled)
        await updateAppointment(appointment.id, { status: 3 });
        checkAppointment();
      } catch (error) {
        console.error('Error canceling appointment:', error);
      }
    }
  };

  const checkAppointment = async () => {
    if (!client?.phone) return;
  
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
    try {
      const appointmentsRef = collection(db, 'appointments');
      const appointmentQuery = query(
        appointmentsRef,
        where('client', '==', client.phone),
        where('status', '==', 0)
      );
  
      const querySnapshot = await getDocs(appointmentQuery);
      
      if (!querySnapshot.empty) {
        const appointmentData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const appointmentDate = new Date(data.date);
  
          // Format the date to MM/DD/YYYY
          const formattedDate = `${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getDate().toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`;
  
          return { id: doc.id, ...data, date: formattedDate };
        });
  
        // Check if the date is today or in the future
        const upcomingAppointment = appointmentData.find(app => {
          const appointmentDate = new Date(app.date);
          return appointmentDate >= todayStart;
        });
  
        if (upcomingAppointment) {
          setAppointment(upcomingAppointment);

          // Fetch the location based on the location ID
          const locationId = upcomingAppointment.location;
          const locationData = await getLocationById(locationId);
          setAppointmentLocation(locationData);
        } else {
          setAppointment(null);
          setAppointmentLocation(null);
        }
      } else {
        setAppointment(null);
        setAppointmentLocation(null); 
      }
    } catch (error) {
      console.error('Error checking appointment:', error);
    }
  };  

  useEffect(() => {
    if (client) {
      checkAppointment();
    }
  }, [client]);

  return (
    <div className="w-screen h-screen bg-cover bg-center" style={{ backgroundImage: "url('/DoctorHeart.webp')" }}>
      <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start w-full h-full px-4 py-8 bg-black bg-opacity-50">
        <JMJButton onClick={logout} text="Log Out" />
        <h2 className="text-3xl font-bold md:flex md:space-x-4 text-white">Welcome, {client?.firstName}.</h2>
        
        {appointment ? (
          <div className="text-white">
            <p>You have an upcoming appointment:</p>
            <p>{appointmentLocation ? appointmentLocation.address : 'Loading...'}</p>
            <p>{appointment.date}, {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
            <p>Status: {appointment.status === 0 ? 'Scheduled' : 'Completed'}</p>
            <JMJButton onClick={cancelAppointment} text="Cancel" className="mt-2" />
          </div>
        ) : (
          <JMJButton onClick={() => navigate("/book")} text="Book Appointment" />
        )}
        <Chatbox />
      </div>
    </div>
  );
};

export default Home;
