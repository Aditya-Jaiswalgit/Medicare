// Utility function to make authenticated API requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  return response;
};

// Example usage:
// const response = await apiRequest("http://localhost:5000/api/users", {
//   method: "GET",
// });
