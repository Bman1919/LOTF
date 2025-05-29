import {useParams} from 'react-router-dom'
import {useSocket} from '../../context/SocketContext.jsx'

export default function Lobby(){
    const {name,id} = useParams();
    const socket = useSocket();

    return (<>
      <p>Am in Lobby</p>
      <h2>{id}</h2>
    </>);
}