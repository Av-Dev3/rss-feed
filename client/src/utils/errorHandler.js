// Global error handler to suppress expected errors

// Suppress console errors for network/CORS issues
const originalError = console.error;
console.error = function(...args) {
  const message = args[0]?.toString() || '';
  
  // Suppress CORS-related errors
  if (
    message.includes('CORS') ||
    message.includes('Failed to fetch') ||
    message.includes('Access-Control-Allow-Origin') ||
    message.includes('429') ||
    message.includes('408') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('rate limit') ||
    message.includes('Too Many Requests')
  ) {
    return; // Don't log these errors
  }
  
  // Log other errors normally
  originalError.apply(console, args);
};

// Suppress unhandled promise rejections for network errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || '';
  if (
    reason.includes('Failed to fetch') ||
    reason.includes('CORS') ||
    reason.includes('429') ||
    reason.includes('408')
  ) {
    event.preventDefault(); // Suppress the error
  }
});

