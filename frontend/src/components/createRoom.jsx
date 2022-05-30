import PropTypes from 'prop-types';
import { useState } from 'preact/hooks';
import styled from 'styled-components';

import { FORMATS, FORMAT_COLUMNS, FORMAT_NAMES } from '../utils/formats.js';
import {Input, Select} from './input.jsx';
import {Button, ClearButton} from './button.jsx';

const Container = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  margin: 10px;
`;

export const CreateRoom = ({ setRoom, socket, cancelCreating }) => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('nickname') || '');
  const [format, setFormat] = useState(localStorage.getItem('format') || FORMATS.AGILE);
  const [voteCount, setVoteCount] = useState(parseInt(localStorage.getItem('voteCount'), 10) || 5);
  const [anonymity, setAnonymity] = useState(localStorage.getItem('anonymity') === 'false' || true);
  const [previousActionItems, setPrevionsActionItems] = useState([]);
  const [startWithActionItemReview, setStartWithActionItemReview] = useState(true);

  const onRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const onFormatChange = (event) => {
    setFormat(event.target.value);
  };

  const onUserNameInput = (event) => {
    setUserName(event.target.value);
  };

  const onVoteCountChange = (event) => {
    setVoteCount(event.target.value);
  };

  const onAnonymityChange = (event) => {
    setAnonymity(event.target.value);
  };

  const onActionItemsUpload = (event) => {
    if (!event.target?.result) return alert('No text content');

    let json;
    try {
      json = JSON.parse(event.target.result);
    } catch(e) {
      console.error(e);
      return alert('File is not valid');
    }

    if (!json.length) return alert('File is not valid');

    const items = [];
    for (const item of json) {
      if (!item.title) return;
      if (!item.date) return;

      items.push({
        title: item.title,
        date: item.date,
      });
    }

    setPrevionsActionItems(items);
  }

  const onActionItemsSelected = (event) => {
    if (!event.target?.files?.length) return alert('Could not load file');

    const reader = new FileReader();
    reader.onload = onActionItemsUpload;
    reader.readAsText(event.target.files[0]);
  };

  const createRoom = async () => {
    const room = await fetch('/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName || userName + '\'s retro',
        format,
        voteCount,
        isAnonymous: anonymity,
        previousActionItems,
        startWithActionItemReview: startWithActionItemReview && previousActionItems.length,
      }),
    }).then((resp) => resp.json());

    setRoom(room);
    socket.emit('join', room.code, userName);

    try {
      localStorage.setItem('nickname', userName);
      localStorage.setItem('format', format);
      localStorage.setItem('voteCount', voteCount);
      localStorage.setItem('anonymity', anonymity);
    } catch (e) {}
  };

  return (
    <div style="text-align: center">
      <Title>
        Create a Retrospective
      </Title>
      <Label>
        Your Nickname<br />
        <Input
          value={userName}
          type="text"
          placeholder="Your Nickname"
          onChange={onUserNameInput}
        ></Input>
      </Label>
      <Label>
        Retro Name<br />
        <Input
          value={roomName}
          type="text"
          placeholder="Retrospective Name"
          onChange={onRoomNameChange}
        ></Input>
      </Label>
      <Label>
        Retro Format<br />
        <Select
          value={format}
          onChange={onFormatChange}
        >
          {Object.values(FORMATS).map((format, idx) => (
            <option value={format}>{FORMAT_NAMES[format]}</option>
          ))}
        </Select>
      </Label>
      <Label>
        Vote Count<br />
        <Input
          value={voteCount}
          type="number"
          placeholder="Vote Count"
          onChange={onVoteCountChange}
        />
      </Label>
      <Label>
        Anonymous<br />
        <Select
          value={anonymity}
          onChange={onAnonymityChange}
        >
          <option value={true}>Enable</option>
          <option value={false}>Disable</option>
        </Select>
      </Label>
      <Label>
        Previous Action Items<br />
        <Input
          type="file"
          name="file"
          onChange={onActionItemsSelected}
        />
      </Label>
      {previousActionItems.length > 0 && (
        <Label>
          <Input
            type="checkbox"
            checked={startWithActionItemReview}
            onChange={() => setStartWithActionItemReview(event.target.checked)}
          />
          Start with action item review
        </Label>
      )}
      
      <Button
        onClick={createRoom}
      >
        Create Retro
      </Button>
      <br />
      <ClearButton
        onClick={cancelCreating}
      >
        Join a Retro Instead
      </ClearButton>
    </div>
  );
};

CreateRoom.propTypes = {
  setRoom: PropTypes.function,
  socket: PropTypes.any,
  cancelCreating: PropTypes.function,
};
