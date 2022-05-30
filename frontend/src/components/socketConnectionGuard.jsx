import { useContext, useEffect } from 'preact/hooks';
import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';

export const SocketConnectionGuard = ({ children }) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  useEffect(() => {
    setTimeout(() => {
      socket?.emit('ping', room?.code);
    });
  }, []);

  console.log(socket, room, room?.me);

  if (!room || !room?.me) return (
    <span>
      Not connected to the room.
    </span>
  );

  return children;
}
