export function startDriftCorrection(getLocalTime, getServerTime, seekFn) {
  const interval = setInterval(() => {
    const local = getLocalTime();
    const server = getServerTime();
    
    if (server === undefined || server === null || local === undefined) return;

    // If we drift by more than 1.5 seconds, force a seek
    if (Math.abs(local - server) > 1.5) {
      seekFn(server);
    }
  }, 5000);

  return () => clearInterval(interval);
}
