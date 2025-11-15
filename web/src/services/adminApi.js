import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin'; // Adjust if your API URL is different

// Helper to get the token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// User Management
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Event Management
export const getAllEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/events`, { ...getAuthHeaders(), params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/events/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getEventAttendance = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}/attendance`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error fetching event attendance for ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Host Management
export const getAllHosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/hosts`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching hosts:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getHostById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/hosts/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error fetching host ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createHost = async (hostData) => {
  try {
    const response = await axios.post(`${API_URL}/hosts`, hostData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating host:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateHost = async (id, hostData) => {
  try {
    const response = await axios.put(`${API_URL}/hosts/${id}`, hostData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error updating host ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteHost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/hosts/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error deleting host ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Event Location Management

export const getAllEventLocations = async () => {

  try {

    const response = await axios.get(`${API_URL}/eventlocations`, getAuthHeaders());

    return response.data;

  } catch (error) {

    console.error('Error fetching event locations:', error.response?.data || error.message);

    throw error.response?.data || error;

  }

};



export const getEventLocationById = async (id) => {

  try {

    const response = await axios.get(`${API_URL}/eventlocations/${id}`, getAuthHeaders());

    return response.data;

  } catch (error) {

    console.error(`Error fetching event location ${id}:`, error.response?.data || error.message);

    throw error.response?.data || error;

  }

};



export const createEventLocation = async (locationData) => {

  try {

    const response = await axios.post(`${API_URL}/eventlocations`, locationData, getAuthHeaders());

    return response.data;

  } catch (error) {

    console.error('Error creating event location:', error.response?.data || error.message);

    throw error.response?.data || error;

  }

};



export const updateEventLocation = async (id, locationData) => {

  try {

    const response = await axios.put(`${API_URL}/eventlocations/${id}`, locationData, getAuthHeaders());

    return response.data;

  } catch (error) {

    console.error(`Error updating event location ${id}:`, error.response?.data || error.message);

    throw error.response?.data || error;

  }

};



export const deleteEventLocation = async (id) => {

  try {

    const response = await axios.delete(`${API_URL}/eventlocations/${id}`, getAuthHeaders());

    return response.data;

  } catch (error) {

    console.error(`Error deleting event location ${id}:`, error.response?.data || error.message);

    throw error.response?.data || error;

  }

};
