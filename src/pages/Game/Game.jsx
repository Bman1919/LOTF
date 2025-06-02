import {useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useSocket} from '../../context/SocketContext.jsx'
import './Game.css'

export default function Game(){
    const [players, setPlayers] = useState([]);

    const {id} = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const gameState = {
        isDay: true,
        conch: 0
    };

    return (<>
    </>);
}