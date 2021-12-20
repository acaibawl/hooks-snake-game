import React, { useCallback, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import { initFields, getFoodPosition } from './utils';
import {
  defaultInterval,
  defaultDifficulty,
  Delta,
  Difficulty,
  Direction,
  DirectionKeyCodeMap,
  GameStatus,
  OppositeDirection,
  initialPosition,
  initialValues,
  isCollision,
  isEatingMyself
} from './constants'

let timer = undefined;

const unsubscribe = () => {
  if(!timer) { return; }
  clearInterval(timer);
}

function App() {
  const [fields, setFields] = useState(initialValues);
  const [body, setBody] = useState([]);
  const [status, setStatus] = useState(GameStatus.init);
  const [direction, setDirection] = useState(Direction.up);
  const [difficulty, setDifficulty] = useState(defaultDifficulty);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setBody([initialPosition]);
    // ゲーム内の時間を管理する
    const interval = Difficulty[difficulty - 1];
    timer = setInterval(() => {
      setTick(tick => tick + 1 );
    }, interval)
    return unsubscribe  // コンポーネントが削除されるときに実行される関数をreturnにセット
  }, [difficulty]);

  useEffect(() => {
    if(body.length === 0 || status !== GameStatus.playing ){ return; }
    const canContinue = handleMoving();
    if(!canContinue) {
      setStatus(GameStatus.gameovr);
    }
  }, [tick]);

  const onStart = () => setStatus(GameStatus.playing);
  const onStop = () => setStatus(GameStatus.suspended);
  const onRestart = () => {
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    }, defaultInterval);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setDirection(Direction.up);
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

  const onChangeDifficulty = useCallback((difficulty) => {
    if(status !== GameStatus.init) { return; }
    if(difficulty < 1 || difficulty > Difficulty.length) { return; }
    setDifficulty(difficulty);
  }, [status, difficulty]);

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
    const {x, y} = body[0];
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y
    };
    if(isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)){
      unsubscribe();
      return false;
    }
    const newBody = [...body];
    if(fields[newPosition.y][newPosition.x] !== 'food') {
      const removingTrack = newBody.pop();
      fields[removingTrack.y][removingTrack.x] = '';
    } else {
      const food = getFoodPosition(fields.length, [...newBody, newPosition]);
      fields[food.y][food.x] = 'food';
    }

    fields[newPosition.y][newPosition.x] = 'snake';
    newBody.unshift(newPosition);
    setBody(newBody);
    setFields(fields);
    return true;
  }

  return (
    <div className="App">
      <header className='header'>
        <div className='title-container'>
          <h1 className='title'>Snake Game</h1>
        </div>
        <Navigation length={body.length} difficulty={difficulty} onChangeDifficulty={onChangeDifficulty} />
      </header>
      <main className='main'>
        <Field fields={fields} />
      </main>
      <footer className='footer'>
        <Button status={status} onStop={onStop} onStart={onStart} onRestart={onRestart} />
        <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
