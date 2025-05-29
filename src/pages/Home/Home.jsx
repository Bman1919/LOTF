import {useState} from 'react'
import './Home.css'

export default function Home() {
  const [lobby,setLobby] = useState(false);
  return (
    <>
        <h1>
            Join a Lobby!
        </h1>
        <input type="text" onInput={()=>{setLobby(true)}} placeholder='ENTER THE LOBBY CODE TO JOIN' className="lobby-enter" />
        <br />
        {lobby &&
        <button>
          Join a Lobby
        </button>}
        <br />
        <button>
          Create a Lobby
        </button>
    </>
  );
}