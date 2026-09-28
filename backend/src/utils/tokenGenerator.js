export const generateTokenNumber = (serviceName, existingLatestToken = null) => {
  const words = serviceName.trim().split(/\s+/);
  let prefix = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : serviceName.slice(0, 1).toUpperCase();

  if (!prefix || !/^[A-Z]+$/.test(prefix)) {
    prefix = 'Q';
  }

  let nextSequence = 101;

  if (existingLatestToken) {
    const parts = existingLatestToken.split('-');
    if (parts.length === 2) {
      const parsedSeq = parseInt(parts[1], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  return `${prefix}-${nextSequence}`;
};
