import { createContext, useContext } from "react";
import { baseUrl } from "../Utils/servise.js";
import axios from 'axios';

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  
    const fetchClients = async () => {
        try {
            const response = await axios.get(`${baseUrl}/fromAdminPage/getActiveUsers`);
            return response.data; // Axios επιστρέφει αυτόματα τα δεδομένα μέσα στο response.data
        } catch (error) {
            console.error("Σφάλμα κατά τη λήψη των clients:", error);
            return []; // Επιστρέφουμε κενό πίνακα αν υπάρχει σφάλμα
        }
    };
 
  return (
    <ClientsContext.Provider value={{
        fetchClients
      }}>

      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => useContext(ClientsContext);