import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";  // Import js-cookie
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const navigate = useNavigate();  // make sure this is within Router context

  // Check if the client is saved in cookies when the app loads
  useEffect(() => {
    const savedClient = Cookies.get("client");  // Get client data from cookies
    if (savedClient) {
      setClient(JSON.parse(savedClient));  // Set the client object from the cookie
    }
  }, []);  // Empty array ensures this runs only once on page load

  const login = async (phoneNumber) => {
    try {
      const clientQuerySnapshot = await getDocs(collection(db, "clients"));
      const foundClient = clientQuerySnapshot.docs.find(doc => doc.data().phone === phoneNumber);

      if (foundClient) {
        const clientData = foundClient.data();
        clientData.id = foundClient.id;  // Add Firestore document ID
        setClient(clientData);

        // Store client data in cookies with an expiration date of 7 days
        Cookies.set("client", JSON.stringify(clientData), { expires: 7 });

        navigate("/home");  // Redirect to the home page after login
      } else {
        alert("Phone number not found. Please register.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("There was an error during login. Please try again.");
    }
  };

  const logout = () => {
    setClient(null);

    // Remove client data from cookies
    Cookies.remove("client");

    navigate("/login");  // Redirect to login page after logout
  };

  const isLoggedIn = client !== null;

  return (
    <AuthContext.Provider value={{ client, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
