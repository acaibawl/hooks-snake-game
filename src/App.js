import React, { useCallback, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import { initFields } from './utils';

const initialPosition = {x: 17, y: 17};
const initialValues = initFields(35, initialPosition);
const defaultInterval = 100;
const GameStatus = Object.freeze({
  init: 'init',
  playing: 'playing',
  suspended: 'suspended',
  gameovr: 'gameover'
});

const Directin = Object.freeze({
  up: 'up',
  right: 'right',
  left: 'left',
  down: 'down'
});

const DirectionKeyCodeMap = Object.freeze({
  37: Directin.left,
  38: Directin.up,
  39: Directin.right,
  40: Directin.down
});

const OppositeDirection = Object.freeze({
  up: 'down',
  right: 'left',
  left: 'right',
  down: 'up'
});

const Delta = Object.freeze({
  up: {x: 0, y: -1},
  right: {x: 1, y: 0},
  left: {x: -1, y: 0},
  down: {x: 0, y: 1}
});

let timer = undefined;

const unsubscribe = () => {
  if(!timer) { return; }
  clearInterval(timer);
}

const isCollision = (fieldSize, position) => {
  if(position.y < 0 || position.x < 0){
    return true;
  }

  if(position.y > fieldSize - 1 || position.x > fieldSize - 1){
    return true;
  }

  return false;
}

function App() {
  const [fields, setFields] = useState(initialValues);
  const [position, setPosition] = useState();
  const [status, setStatus] = useState(GameStatus.init);
  const [direction, setDirection] = useState(Directin.up);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setPosition(initialPosition);
    // ゲーム内の時間を管理する
    timer = setInterval(() => {
      setTick(tick => tick + 1 );
    }, defaultInterval)
    return unsubscribe  // コンポーネントが削除されるときに実行される関数をreturnにセット
  }, []);

  useEffect(() => {
    if(!position || status !== GameStatus.playing ){ return; }
    const canContinue = handleMoving();
    if(!canContinue) {
      setStatus(GameStatus.gameovr);
    }
  }, [tick]);

  const onStart = () => setStatus(GameStatus.playing);
  const onRestart = () => {
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    }, defaultInterval);
    setStatus(GameStatus.init);
    setPosition(initialPosition);
    setDirection(Directin.up);
    setFields(initFields(35, initialPosition));
  }

  const onChangeDirection = useCallback((newDirection) => {
    if (status !== GameStatus.playing) {
      return direction
    }
    if (OppositeDirection[direction] === newDirection) {
      return
    }
    setDirection(newDirection)
  }, [direction, status]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      if(!newDirection) { return; }

      onChangeDirection(newDirection);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChangeDirection]);

  const handleMoving = () => {
    const {x, y} = position;
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y
    };
    if(isCollision(fields.length, newPosition)){
      unsubscribe();
      return false;
    }
    fields[y][x] = '';
    fields[newPosition.y][newPosition.x] = 'snake';
    setPosition(newPosition);
    setFields(fields);
    return true;
  }

  return (
    <div className="App">
      <header className='header'>
        <div className='title-container'>
          <h1 className='title'>Snake Game</h1>
        </div>
        <Navigation />
      </header>
      <main className='main'>
        <Field fields={fields} />
      </main>
      <div style={{ padding: '16px' }}>
        <button onClick={handleMoving} >進む</button>
      </div>
      <footer className='footer'>
        <Button status={status} onStart={onStart} onRestart={onRestart} />
        <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
