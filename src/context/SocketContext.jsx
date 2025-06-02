import { createContext, useContext, useEffect, useState} from 'react'
import {io} from 'socket.io-client'

const SocketContext = createContext(null);

export function useSocket(){
    return useContext(SocketContext);
}

export function SocketProvider({children}){
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const PORT = 3001;
        const newSocket = io(`http://localhost:${PORT}`);
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}