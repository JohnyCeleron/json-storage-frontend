import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export function Square() {
  const [value, setValue] = useState<string | null>(null);

  function handleClick() {
    if (value === null) {
      setValue('X');
    } else {
      setValue(null);
    }
  }

  return (
    <button
      className="square"
      onClick={handleClick}
    >
      {value}
    </button>
  )
}

export function Board() {
  const rows = 3;
  const cols = 3;

  return (
    <>
      {Array.from({length: rows}).map((_, row) => (
        <div key={row} className="board-row">
          {Array.from({length: cols}).map((_, col) => (
            <Square key={row * cols + col} />
          ))}
        </div>
      ))}
    </>
  );
}
