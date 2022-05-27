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

  const me = room?.members.find((member) => member.ioClientId === socket.io.engine.id);

  console.log(socket, room, me);

  if (!room || !me) return (
    <span>
      Not connected to the room.
    </span>
  );

  return children;
}
