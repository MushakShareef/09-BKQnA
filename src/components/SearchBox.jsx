



import React from 'react';
import { listenTamil } from '../utils/listenTamil';

function SearchBox({ inputText, setInputText, onSearch }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder="உங்களின் கேள்வியை இங்கு எழுதுங்கள்"
        style={{ flexGrow: 1, padding: '10px', fontSize: '1rem', borderRadius: '8px' }}
      />
      <button onClick={onSearch}>தேடு</button>
      <button onClick={() => listenTamil(setInputText)}>🎤</button>
    </div>
  );
}

export default SearchBox;
