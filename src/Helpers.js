export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
};

export const formatTime = (time) => {
  const hours = Math.floor(time); // Whole number
  const minutes = Math.round((time % 1) * 60); // Turns decimal into minutes
  const ampm = hours >= 12 ? "PM" : "AM";

  let formattedHours = hours % 12 || 12; // Turns 14 into 2 PM, for example
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const getClientById = (clientId, clients) => {
  const client = clients.find(client => client.id === clientId);
  return client || null;
};

export const getClientByPhone = (clientPhone, clients) => {
  const client = clients.find(client => client.phone === clientPhone);
  return client || null;
}