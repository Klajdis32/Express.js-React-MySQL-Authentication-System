import './clients.css';
import { useNavigate } from "react-router-dom";
import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from "../../Context/AuthContext";
import { useClients } from "../../Context/ClientsContext";

const Clients = () => {
    const { user, dispatch } = useContext(AuthContext);
    const { fetchClients } = useClients(); // Χρήση του fetchClients από το context
    const navigate = useNavigate(); 

    const [clients, setClients] = useState([]); // Κρατάμε τους χρήστες στο state

    useEffect(() => {
        const localStorageUser = JSON.parse(localStorage.getItem('user'));
    
        if (!localStorageUser) {
            navigate("/");
        } else if (localStorageUser.Verification !== true && localStorageUser.Verification !== 1) {
            navigate("/");
        } else if (!user) {
            dispatch({ type: "LOGIN_SUCCESS", payload: localStorageUser });
        }
    }, [user, navigate, dispatch]);

    // Φόρτωση χρηστών από το API
    useEffect(() => {
        const getClients = async () => {
            const data = await fetchClients(); // Καλούμε τη συνάρτηση από το context
            setClients(data);
        };

        getClients();
    }, []);

    return (
        <div className='ClientsIn'>
            <div className='topanwp'>
                <h3>Clients</h3>
            </div>

            <h3>Online now:</h3>
            <div className="clients-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length > 0 ? (
                            clients.map(client => (
                                <tr key={client.id}>
                                    <td>{client.id}</td>
                                    <td>{client.Username}</td>
                                    <td>{client.Email}</td>
                                    <td>{client.isAdmin ? "Yes" : "No"}</td>
                                    <td>{client.Verification ? "Yes" : "No"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No online clients right now!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Clients;