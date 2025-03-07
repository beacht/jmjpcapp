
export const formatTime = (hours) => {
if (hours < 0 || hours > 23) {
    throw new Error('Hours must be between 0 and 23.');
}

const period = hours >= 12 ? 'PM' : 'AM';
const formattedHour = hours % 12 === 0 ? 12 : hours % 12;

return `${formattedHour} ${period}`;
};
  