// src/services/racismDataService.ts
import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Replace with your backend URL

// Mocked data
const mockedData = [
  {
    title: "Mocked Event 1",
    source: "Source 1",
    url: "http://example.com/1",
    date: new Date().toISOString(),
  },
  {
    title: "Mocked Event 2",
    source: "Source 2",
    url: "http://example.com/2",
    date: new Date().toISOString(),
  },
  // ... more mocked data
];

export const fetchRacismData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/racist-events`);
    // If there is no data, return mocked data
    return response.data.length > 0 ? response.data : mockedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return mocked data in case of an error
    return mockedData;
  }
};
