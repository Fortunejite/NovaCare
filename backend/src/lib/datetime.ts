export const isPastDateTime = (datetime: Date | string): boolean => {
  const now = new Date();
  return new Date(datetime) < now;
};

export const isPastDate = (date: Date | string): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dateWithoutTime = new Date(date);
  dateWithoutTime.setHours(0, 0, 0, 0);
  return dateWithoutTime < now;
};
