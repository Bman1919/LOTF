import { createContext, useContext, useEffect, useRef} from 'react'
import {io} from 'socket.io-client'

const SocketContext = createContext(null);

export function useSocket(){
    return useContext(SocketContext);
}

export function SocketProvider({children}){
    const socketRef = useRef();

    useEffect(() => {
        const PORT = 3001;
        socketRef.current = io(`http://localhost:${PORT}`);
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
}