export const calculateEstimatedWaitMinutes = (peopleAhead, avgServiceTimeSeconds = 300) => {
  if (peopleAhead <= 0) return 0;
  const totalSeconds = peopleAhead * avgServiceTimeSeconds;
  return Math.ceil(totalSeconds / 60);
};
