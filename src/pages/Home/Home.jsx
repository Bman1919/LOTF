import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import './Home.css'

export default function Home() {
  const [lobby,setLobby] = useState(false);
  const [name, setName] = useState("");
  const [joinId, setJoinId] = useState("");
  const navigate = useNavigate();

  function createLobby(){
    let lobbyId = generateLobbyId();
    navigate(`/lobby/${name}/${lobbyId}`);
  }

  function joinLobby(){
    navigate(`/lobby/${name}/${joinId}`);
  }

  return (
    <>
        <h1>
            Join a Lobby!
        </h1>
        <input type="text" onChange={(e) => {setJoinId(e.target.value)}} onInput={()=>{setLobby(true)}} placeholder='ENTER THE LOBBY CODE TO JOIN' className="lobby-enter" />
        <br />
        {lobby &&
        <button onClick={joinLobby}>
          Join a Lobby
        </button>}
        <br />
        <button onClick={createLobby}>
          Create a Lobby
        </button>
    </>
  );
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateLobbyId() {
  let lobbyId = "";
  for (let i = 0; i < 4; i++) {
    lobbyId += letters[Math.floor(Math.random() * letters.length)];
  }
  return lobbyId;
}