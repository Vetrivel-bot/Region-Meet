const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"; // Adjust as per your backend URL

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

// User Management
export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Host Management
export const getAllHosts = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/hosts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getHostById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/hosts/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createHost = async (hostData) => {
  const response = await fetch(`${API_BASE_URL}/admin/hosts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(hostData),
  });
  return handleResponse(response);
};

export const updateHost = async (id, hostData) => {
  const response = await fetch(`${API_BASE_URL}/admin/hosts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(hostData),
  });
  return handleResponse(response);
};

export const deleteHost = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/hosts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Event Location Management
export const getAllEventLocations = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/eventlocations`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getEventLocationById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/eventlocations/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createEventLocation = async (locationData) => {
  const response = await fetch(`${API_BASE_URL}/admin/eventlocations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData),
  });
  return handleResponse(response);
};

export const updateEventLocation = async (id, locationData) => {
  const response = await fetch(`${API_BASE_URL}/admin/eventlocations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData),
  });
  return handleResponse(response);
};

export const deleteEventLocation = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/eventlocations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
