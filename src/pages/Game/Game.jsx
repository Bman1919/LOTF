import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useSocket} from '../../context/SocketContext.jsx'
import charactersData from '../../assets/character.json';
import './Game.css'
import DayMenu from './DayMenu/DayMenu.jsx'

export default function Game(){
    const [players, setPlayers] = useState([]);
    const [isDay, setIsDay] = useState(true);
    const [conch, setConch] = useState(0);

    const {id} = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const [event, setEvent] = useState({
        type: "None"
    });

    function syncGameState(gameState){
        console.log('Got a sync-game-state: ',gameState);
        if(!gameState || !gameState.gameState) return;
        setIsDay(gameState.gameState.isDay);
        setConch(gameState.gameState.conch);
        setPlayers(gameState.players);
        console.log('Synced: ',gameState);
    }

    useEffect(() => {
        if(!socket) return;
        console.log(event);
        socket.emit('sync-event', event, id);
    }, [socket, event]);

    useEffect(() => {
        if(!socket) return () => {};
        socket.emit('get-game-state',id,syncGameState);
        socket.on('sync-game-state', syncGameState);
        return () => {
            socket.off('sync-game-state',syncGameState);
        }
    }, [socket, id]);

    useEffect(() => {
        document.body.style.backgroundColor = isDay ?  "#f3e9e2" : "#322f2f";
        return () => {
            document.body.style.backgroundColor = "";
        };
    }, [isDay]);

    useEffect(() => {
        const interval = setInterval(() => {
            if(!socket || !id) return;
            socket.emit('get-game-state',id,syncGameState);
        }, 500);
        return () => {clearInterval(interval);}
    }, [id, socket]);

    return (<>
        <ul className="players-table">
            <li className="players-header">
                <span>Avatar</span>
                <span>Name</span>
                <span>HP</span>
                <span>Food</span>
                <span>Resources</span>
                <span></span>
            </li>
            {players.map((u, i) => {
                const character = charactersData.characters?.[u.characterIndex] || {};
                if(!u) return null;
                return (
                <li className={`players-row${u.registeredEvent?.type === "None" ? "" : " regEvent"}${u.id === socket.id ? " me" : ""}`} key={i}>
                    <span>
                    <img src={`/${character.image}`} alt={character.name} />
                    </span>
                    <span>{`${character.name}${(socket.id === u.id) ? " (me)" : ""}`}</span>
                    <span>{u.HP}</span>
                    <span>{u.food}</span>
                    <span>{u.resources}</span>
                    <span>
                    {(i === conch) && <img src="/conch.png" />}
                    </span>
                </li>
                );
            })}
        </ul>
        {
            (isDay) && (
                <DayMenu eventHandler={setEvent}/>
            )
        }
    </>);
}