import { useState, useEffect } from "react";
import { motion } from "motion/react";
import puzzleImage from "./../../assets/images/puzzle-light.jpg";
import "./SlidingPuzzle.scss";

export default function SlidingPuzzle({ setPuzzleSolved, setIsSolved, isSolved }) {
  const GRID_SIZE = 3;
  const MISSING_TILE = 0;
  const IMAGE_URL = puzzleImage;

  const generateGrid = () => {
    let numbers = [...Array(GRID_SIZE * GRID_SIZE).keys()];
    numbers.sort(() => Math.random() - 0.5);
    return numbers;
  };

  const solvedState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [grid, setGrid] = useState(generateGrid());
  const [imageVisible, setImageVisible] = useState(false);
  const [moving, setMoving] = useState(false); // remove everywhere if not keeping box shadow

  const missingIndex = grid.indexOf(MISSING_TILE);

  const isMovable = (index) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(missingIndex / GRID_SIZE);
    const emptyCol = missingIndex % GRID_SIZE;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const handleMove = (index) => {
    if (!isMovable(index) || isSolved) return;

    setMoving(true);

    const newGrid = [...grid];
    [newGrid[index], newGrid[missingIndex]] = [
      newGrid[missingIndex],
      newGrid[index],
    ];
    setGrid(newGrid);
    setTimeout(() => {
        setMoving(false);
      }, 500);
  };

  useEffect(() => {
    const checkSolved = () => {
      if (JSON.stringify(grid) === JSON.stringify(solvedState)) {
        setIsSolved(true);
        setPuzzleSolved(true);
        setTimeout(() => {
          setImageVisible(true);
        }, 200);
      }
    };

    checkSolved();
  }, [grid]);

  const reshuffle = () => {
    setGrid(generateGrid());
    setIsSolved(false);
  };

  // const autoSolve = () => {
  //   setGrid(solvedState);
  //   setIsSolved(true);
  //   setTimeout(() => {
  //     setImageVisible(true);
  //   }, 200);
  // };

  return (
    <div className="sliding-puzzle">
      <div className="sliding-puzzle__grid">
        {grid.map((num, index) => {
          const row = Math.floor((num - 1) / GRID_SIZE);
          const col = (num - 1) % GRID_SIZE;

          return (
            <motion.div
              key={num}
              className={`sliding-puzzle__tile ${
                num === MISSING_TILE ? "sliding-puzzle__tile--empty" : ""
              } ${isSolved ? "sliding-puzzle__tile--solved" : ""} ${moving ? "sliding-puzzle__tile--moving" : ""}`}
              onClick={() => handleMove(index)}
              layout 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                backgroundImage: num !== MISSING_TILE ? `url(${IMAGE_URL})` : "none",
                backgroundPosition: `${-col * 6.25}rem ${-row * 6.25}rem`,
              }}
            />
          );
        })}
        {isSolved && (
          <div
            className={`sliding-puzzle__image ${
              imageVisible ? "sliding-puzzle__image--visible" : ""
            }`}
          />
        )}
      </div>

      {!isSolved && (
        <>
          {/* <button
            className="sliding-puzzle__button"
            onClick={autoSolve}
            disabled={isSolved}
          >
            Auto-solve
          </button> */}
          <button
            className="sliding-puzzle__button"
            onClick={reshuffle}
            disabled={isSolved}
          >
            Reshuffle
          </button>
        </>
      )}
    </div>
  );
}
