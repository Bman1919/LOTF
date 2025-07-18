import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useSocket} from '../../context/SocketContext.jsx'
import charactersData from '../../assets/character.json';
import './Game.css'
import DayMenu from './DayMenu/DayMenu.jsx'
import Project from './Project/Project.jsx'

export default function Game({playerId}){
    const [players, setPlayers] = useState([]);
    const [isDay, setIsDay] = useState(true);
    const [conch, setConch] = useState(0);
    const [projects, setProjects] = useState([]);

    const [anim, setAnim] = useState(<></>);

    const {id} = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        console.log(`Id: ${id}, playerId: ${playerId}`);
    }, [id,playerId]);

    const [event, setEvent] = useState({
        type: "None"
    });

    function syncGameState(gameState){
        console.log('Got a sync-game-state: ',gameState);
        if(!gameState || !gameState.gameState) return;
        setIsDay(gameState.gameState.isDay);
        setConch(gameState.gameState.conch);
        setPlayers(gameState.players);
        setProjects(gameState.gameState.projects);
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
        if(!socket) return () => {};
        let handleAnimation = async (seq) => {
            console.log("Animate request hit here");
            for(let scene of seq){
                switch(scene.type){
                    case "action": {
                        let player = scene.player;
                        switch(scene.action){
                            case "project": {
                                let project = scene.project;
                                setAnim(<div>{player.name} gives {scene.amount} to {project.name}</div>);
                                await delay(1000);
                            } break;
                            case "food": break;
                            case "resources": break;
                        }
                    } break;
                    case "project":{
                    }break;
                    case "time":{
                        if(scene.action === "nightime")
                            setIsDay(false);
                    }break;
                }
            }

            setAnim(<></>);
        };
        socket.on("animate", handleAnimation);
        return () =>{
            socket.off("animate", handleAnimation);
        }
    }, [socket]);

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
            <li className="players-header" key={-1}>
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
                <li className={`players-row${u.registeredEvent?.type === "None" ? "" : " regEvent"}${u.characterIndex === playerId ? " me" : ""}`} key={i}>
                    <span>
                    <img src={`/${character.image}`} alt={character.name} />
                    </span>
                    <span>{`${character.name}${(u.characterIndex === playerId) ? " (me)" : ""}`}</span>
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
        <div>
            {
                (isDay) && (
                    <DayMenu eventHandler={setEvent} projectState={projects} player={charactersData.characters?.[playerId] || {}}/>
                )
            }
        </div>
        {anim}
    </>);
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}