import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from "../AuthContext";

const Book = () => {
  const [appointments, setAppointments] = useState([]);
  const [closures, setClosures] = useState([]);
  const [locations, setLocations] = useState([]);
  const [noLanguages, setNoLanguages] = useState([]);
  const [today, setToday] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const { client } = useAuth();
  const [nextFiveDays, setNextFiveDays] = useState([]);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    setToday(formattedDate);
    fetchData();
    generateNextFiveDays();
  }, []);

  const generateNextFiveDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const nextDay = new Date();
      nextDay.setDate(new Date().getDate() + i);
      days.push(nextDay);
    }
    setNextFiveDays(days);
  };

  const fetchData = async () => {
    try {
      const [appointmentsQuerySnapshot, closuresQuerySnapshot, locationsQuerySnapshot, noLanguagesQuerySnapshot] = await Promise.all([
        getDocs(collection(db, "appointments")),
        getDocs(collection(db, "closures")),
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "noLanguages")),
      ]);
      setAppointments(appointmentsQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setClosures(closuresQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLocations(locationsQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setNoLanguages(noLanguagesQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id})))
      console.log(noLanguages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getLocationById = (locationId) => locations.find(location => location.id === locationId) || null;

  const updateAvailableTimes = () => {
    if (!selectedLocation || !selectedDate) return;

    const location = getLocationById(selectedLocation);
    if (!location) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    const locationIdx = parseInt(selectedLocation);

    const available = [...Array(24).keys()].filter(hour => {
      const isWithinOperatingHours = hour >= location.openTime && hour < location.closeTime;
      const hasAppointment = appointments.some(app => app.date === formattedDate && app.startTime === hour && app.location === locationIdx && app.status !== 3);
      const hasClosure = closures.some(closure => closure.date === formattedDate && closure.startTime <= hour && closure.endTime > hour && closure.location === locationIdx);
      const clientLanguageUnavailable = noLanguages.some(unavailability => unavailability.date === formattedDate && unavailability.location === locationIdx && unavailability.language === client.language)
      return isWithinOperatingHours && !hasAppointment && !hasClosure && !clientLanguageUnavailable;
    });

    setAvailableTimes(available);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedLocation || !client) {
      alert("Please fill out all fields");
      return;
    }
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    const hour = parseInt(selectedTime, 10);

    try {
      await addDoc(collection(db, "appointments"), {
        date: formattedDate,
        startTime: hour,
        endTime: hour + 1,
        location: parseInt(selectedLocation),
        client: client.id,
      });
      fetchData();
      alert("Appointment booked successfully");
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const updateFilteredLocations = () => {
    if (!selectedDate) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const openLocations = locations.filter(location => location.daysOpen[dayOfWeek]);

    setFilteredLocations(openLocations);
  };

  const getAvailableTimesForLocationAndDay = (location, day) => {
    const dateObj = new Date(day);
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    const locationIdx = parseInt(location.id);

    return [...Array(24).keys()].filter(hour => {
      const isWithinOperatingHours = hour >= location.openTime && hour < location.closeTime;
      const hasAppointment = appointments.some(app => app.date === formattedDate && app.startTime === hour && app.location === locationIdx && app.status !== 3); // Status 0 = scheduled, 1 = show, 2 = no-show, 3 = cancelled, 4 = rescheduled
      const hasClosure = closures.some(closure => closure.date === formattedDate && closure.startTime <= hour && closure.endTime > hour && closure.location === locationIdx);
      const clientLanguageUnavailable = noLanguages.some(unavailability => unavailability.date === formattedDate && unavailability.location === locationIdx && unavailability.language === client.language)
      console.log(formattedDate, isWithinOperatingHours, hasAppointment, hasClosure, clientLanguageUnavailable);
      return isWithinOperatingHours && !hasAppointment && !hasClosure && !clientLanguageUnavailable;
    });
  };

  useEffect(() => {
    updateAvailableTimes();
  }, [selectedLocation, selectedDate]);

  useEffect(() => {
    updateFilteredLocations();
  }, [selectedDate]);

  return (
    <div>
      <h1>Book Appointment {client.firstName}</h1>

      <h2>Create New Appointment</h2>

      <div>
        <h3>Location Availability for the Next 5 Days:</h3>
        {locations.map(location => (
          <div key={location.id}>
            <h4>{location.name}:</h4>
            {nextFiveDays.map((day, index) => {
              const dayOfWeek = day.getDay();
              const isOpen = location.daysOpen[dayOfWeek];
              if (isOpen) {
                const openTime = new Date(day).setHours(location.openTime, 0, 0, 0);
                const closeTime = new Date(day).setHours(location.closeTime, 0, 0, 0);
                const availableHours = getAvailableTimesForLocationAndDay(location, day);

                return (
                  <div key={index}>
                    <span>{day.toLocaleDateString()}:</span> 
                    <span>{new Date(openTime).toLocaleTimeString()} - {new Date(closeTime).toLocaleTimeString()}</span>
                    <div>
                      Available hours: {availableHours.join(", ")}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index}>
                    <span>{day.toLocaleDateString()}: Closed</span>
                  </div>
                );
              }
            })}
          </div>
        ))}
      </div>

      <label>Date (up to a week in advance): 
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} max={new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]} />
      </label>
      {selectedLocation !== "" && selectedDate !== "" && <label>Time (available slots only): 
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          <option value="">Select Time</option>
          {availableTimes.map(hour => (
            <option key={hour} value={hour}>{hour % 12 === 0 ? 12 : hour % 12}:00 {hour < 12 ? "AM" : "PM"}</option>
          ))}
        </select>
      </label>}
      <label>Location: 
        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="">Select Location</option>
          {filteredLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
      </label>
      <button onClick={handleBooking}>Book Appointment</button>
    </div>
  );
};

export default Book;
