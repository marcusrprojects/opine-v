// Utility function to wrap an async function with loading management
export const withLoading = async (setLoading, asyncFn) => {
  setLoading(true); // Enable loading state
  try {
    await asyncFn(); // Execute the passed async function
  } finally {
    setLoading(false); // Disable loading state when done
  }
};
