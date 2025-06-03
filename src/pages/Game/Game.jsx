import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useSocket} from '../../context/SocketContext.jsx'
import charactersData from '../../assets/character.json';
import './Game.css'

export default function Game(){
    const [players, setPlayers] = useState([]);
    const [isDay, setIsDay] = useState(true);
    const [conch, setConch] = useState(0);

    const {id} = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if(!socket) return () => {};
        function syncGameState(gameState){
            setIsDay(gameState.gameState.isDay);
            setConch(gameState.gameState.conch);
            setPlayers(gameState.players);
        }
        socket.emit('get-game-state',id,syncGameState);
        socket.on('sync-game-state', syncGameState);
        return () => {
            socket.off('sync-game-state',syncGameState);
        }
    }, [socket]);

    useEffect(() => {
        document.body.style.backgroundColor = isDay ? "#322f2f" : "#f3e9e2";
        return () => {
            document.body.style.backgroundColor = "";
        };
    }, [isDay]);

    return (<>
        <ul className="players">
            {
                players.map((u,i)=>{
                    const character = charactersData.characters?.[u.characterIndex] || {};
                    return <li className="players-item">{character.name}</li>
                })
            }
        </ul>
    </>);
}