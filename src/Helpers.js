export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
};

export const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    let formattedHours = parseInt(hours, 10);
    const ampm = formattedHours >= 12 ? "PM" : "AM";
  
    formattedHours = formattedHours % 12;
    formattedHours = formattedHours ? formattedHours : 12;
  
    return `${formattedHours}:${minutes} ${ampm}`;
};
