import axios from "axios";
import { createContext, useEffect, useState,useMemo } from "react";
import { FaWifi } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export const AppContext = createContext();



export const AppContextProvider = (props)=> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);
    const navigate = useNavigate();
    const getAuthState = async ()=> {
        axios.defaults.withCredentials=true;
        try {
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth');
            if(data.success) {
                setIsLoggedin(true);
                getUserData();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const getUserData = async ()=> {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.get(backendUrl+"/api/user/data");
            data.success ? setUserData(data.userData) : toast.error(data.message);
            // console.log(response);
        } catch (error) {
            toast.error(error.response);
        }
    }

    useEffect(()=> {
        getAuthState();
    },[])

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}