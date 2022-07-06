import { useState, useContext, useEffect } from 'preact/hooks';
import styled from 'styled-components';

import { SocketContext } from '../contexts/socket.jsx';
import { RoomContext } from '../contexts/room.jsx';
import { ThemeContext } from '../contexts/theme.jsx';
import { Button, ClearButton } from './button.jsx';
import {Popover} from './popover.jsx';

const MS_TO_HR = 3.6e6;
const MS_TO_MIN = 6e4;
const MS_TO_SEC = 1000;

const getRemainingMS = (date) => date - new Date();
const getRemainingHrs = (date) => Math.floor(getRemainingMS(date) / MS_TO_HR);
const getRemainingMins = (date) => Math.floor(getRemainingMS(date) % MS_TO_HR / MS_TO_MIN);
const getRemainingSecs = (date) => Math.floor(getRemainingMS(date) % MS_TO_MIN / MS_TO_SEC);

const TIME_PRESETS = [{
  title: '30 Seconds',
  ms: 30000,
}, {
  title: '1 Minute',
  ms: 60000,
}, {
  title: '2 Minutes',
  ms: 120000,
}, {
  title: '3 Minutes',
  ms: 180000,
}, {
  title: '4 Minutes',
  ms: 240000,
}, {
  title: '5 Minutes',
  ms: 300000,
}, {
  title: '10 Minutes',
  ms: 600000,
}, {
  title: '15 Minutes',
  ms: 900000,
}, {
  title: '30 Minutes',
  ms: 1.8e6,
}, {
  title: '45 Minutes',
  ms: 2.7e6,
}, {
  title: '60 Minutes',
  ms: 3.6e6,
}]

const StyledButton = styled(Button)`
  @keyframes breathe {
    from {background-color: red;}
    to {background-color: darkred;}
  }
  
  ${(props) => props.finished ? 'animation: breathe 1s linear infinite alternate;' : ''}
  ${(props) => props.finished ? 'background: red;' : ''}
`;

const StyledPopover = styled(Popover)`
  display: flex;
  flex-direction: column;
  width: 150px;
`;

export const Timer = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

  const [showMenu, setShowMenu] = useState(false);
  const [_, setCurrentTime] = useState(new Date().getTime());

  const setTimer = (offset) => {
    const newEnd = new Date().getTime() + offset;
    socket.emit('timer.set', room.code, newEnd);
    setShowMenu(false);
  }

  const clearTimer = () => {
    socket.emit('timer.clear', room.code);
    setShowMenu(false);
  }

  useEffect(() => {
    // Cause re-render of this component to display current time countdown
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const timerEnd = room.timerEnd ? new Date(room.timerEnd) : new Date();
  const isEnded = getRemainingMS(timerEnd) < 0;

  const timeRemaining = `${getRemainingHrs(timerEnd)}H ${getRemainingMins(timerEnd)}M ${getRemainingSecs(timerEnd)}S`;

  const ended = 'Time\'s up!';

  const set = 'Set timer';

  let buttonContent = set;
  if (room.timerEnd) {
    if (isEnded) buttonContent = ended;
    else buttonContent = timeRemaining;
  }

  return (
    <>
      <StyledButton finished={room.timerEnd && isEnded} onClick={() => setShowMenu(!showMenu)}>
        {buttonContent}
      </StyledButton>
      {showMenu && (
        <StyledPopover theme={themeContext.theme}>
          {room.timerEnd && (
            <ClearButton onClick={() => clearTimer()}>
              Cancel Timer
            </ClearButton>
          )}
          {TIME_PRESETS.map((preset) => (
            <ClearButton onClick={() => setTimer(preset.ms)}>
              {preset.title}
            </ClearButton>
          ))}
        </StyledPopover>
      )}
    </>
  );
};
