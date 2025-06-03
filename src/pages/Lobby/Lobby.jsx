import {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import charactersData from '../../assets/character.json';
import {useSocket} from '../../context/SocketContext.jsx'
import './Lobby.css'

export default function Lobby(){
    const {id} = useParams();
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState(-1);
    const [tempId, setTempId] = useState(-1);
    const navigate = useNavigate();
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
      const interval = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1);
      }, 500);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      document.title = `${id} | LOTF`;
      return () => {document.title = "LOTF";}
    }, [id]);

    
    function gameStart(){
      console.log(`to start game at ${id}`);
      navigate(`/game/${id}`);
    }

    useEffect(() => {
      console.log('Socket in Lobby: ', socket);
      if(!socket) return;

      socket.emit('join-lobby', id);

      socket.on('lobby-users', setUsers);

      socket.on('game-started',gameStart);

      return () => {
        socket.emit('leave-lobby',id);
        socket.off('lobby-users',setUsers);
        socket.off('game-started',gameStart);
      };
    }, [socket, id]);

    useEffect(() => {
      if(socket)
        socket.emit('change-user', userId);
    }, [socket, userId]);

    return (<>
      {(!socket) 
        ? <div>Connecting to lobby {id}...</div> 
        : userId === -1 ? (
          <>
            <div className="character-select-container">
              <div>
                <h2>Select Your Character</h2>
                  <div className="character-grid">
                  {charactersData.characters.map((char, idx) => {
                    const taken = users.some(u => u.characterIndex === idx);
                    return (
                      <div key ={idx}
                        className={`character-card${taken ? " taken" : ""}${tempId === idx ? " selected" : ""}`}
                        onClick={() => !taken && setTempId(idx)}
                        style={{pointerEvents: taken ? "none" : "auto"}}
                        title={`${char.name}: ${char.shorthand}`}
                        >
                          <img src={`/${char.image}`} alt={char.name} />
                          <div>{char.name}</div>
                        </div>
                    );
                  })}
                </div>
              </div>
              {tempId !== -1 && (
                <div className={`character-profile-card`}>
                  <img className="character-profile-img" src={`/${charactersData.characters[tempId].image}`} alt={charactersData.characters[tempId].name} />
                  <h3>{charactersData.characters[tempId].name}</h3>
                  <div className="character-profile-shorthand">{charactersData.characters[tempId].shorthand}</div>
                  <div className="character-profile-desc">{charactersData.characters[tempId].description}</div>
                  <button onClick={() => setUserId(tempId)} disabled={users.some(u => (u.characterIndex === tempId))}>Select</button>
                </div>
              )}
            </div>
          </>
        ) : (<>
          <p>Am in Lobby</p>
          <h2>{id}</h2>
          <h3>Players in this lobby:</h3>
          <ul style ={{listStyle: "none", pading: 0}}>
            {users.map((u,i) => {
              console.log(`char index: ${u.characterIndex}`);
              const character = charactersData.characters?.[u.characterIndex] || {};
              return (
                <li key={u.id || i}>
                  <div className={`character-box${(u.characterIndex === userId ? " me" : "")}`}>
                    <img 
                      className="character-img"
                      src={character.image ? `/${character.image}` : `/characters/default-player.png`}
                      alt={character.name || "Player"}
                    />
                    <div className="character-info">
                      <span className="character-name">{`${character.name || `Player Selecting Character${'.'.repeat(dotCount)}`}${(u.characterIndex === userId ? " (me)" : "")}`}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="lobby-buttons">
            <button className="lobby-button" onClick={() => {setUserId(-1);}}>Change</button>
            <button className="lobby-button" disabled={
              users.some(u => u.characterIndex === -1)
            } onClick={() => {if(!socket) return; socket.emit('start-game',id); gameStart();}}>Start</button>
          </div>
        </>)
      }
    </>);
}