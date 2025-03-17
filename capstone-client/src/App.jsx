import "./App.scss";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import TitlePage from "./pages/TitlePage/TitlePage";
import PageLayout from "./components/PageLayout/PageLayout";
import Menu from "./components/Menu/Menu";
import WallOfFame from "./pages/WallOfFame/WallOfFame";
import TextToSpeech from "./components/TextToSpeech/TextToSpeech";

import skull from "./assets/images/skull.png";
import heart from "./assets/images/heart.png";
import brain from "./assets/images/brain.png";
import book from "./assets/images/book.png";
import treasure from "./assets/images/treasure.png";
import restart from "./assets/icons/restart.png";
import audioOn from "./assets/icons/audio-on.png";
import audioOff from "./assets/icons/audio-off.png";
import {useAudio} from "./utils/audioUtils"

function App() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const isTitlePage = location.pathname === "/";

  const [isSolved, setIsSolved] = useState(false);
  const [isSpelled, setIsSpelled] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [wasHighlighted, setWasHighlighted] = useState(false);
  const [symbol, setSymbol] = useState(null);

  const { musicPlay, volume, handleVolumeChange, toggleMusic, isAudioOn } = useAudio(isTitlePage);

  const symbolImages = {
    skull,
    heart,
    brain,
    book,
    treasure,
  };

  useEffect(() => {
    if (!isTitlePage) {
      musicPlay();
    }
  }, [isTitlePage]);
  
  const handleRestart = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="screen">
      <header className="header">
        {!isTitlePage && <button className="header__restart" onClick={handleRestart}><img className={`header__icon ${isDead ? "header__icon--spinning" : ""}`} src={restart} alt="Restart icon" /></button>}
        {!isTitlePage && <TextToSpeech />}
        {!isTitlePage && (
          <button className="header__audio" onClick={toggleMusic}>
           <img className="header__icon" src={isAudioOn ? audioOn : audioOff} alt="Audio icon" />
          </button>
        )}
      </header>
      <main className="main">
        {symbol && (
          <img
            className="symbol symbol--left"
            src={symbolImages[symbol] || book}
            alt="Page symbol"
          ></img>
        )}
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route
            path="/:pageId"
            element={
              <PageLayout
                isDead={isDead}
                setIsDead={setIsDead}
                isSolved={isSolved}
                setIsSolved={setIsSolved}
                setIsSpelled={setIsSpelled}
                setWasHighlighted={setWasHighlighted}
                setSymbol={setSymbol}
                symbol={symbol}
              />
            }
          />
          <Route path="/wall-of-fame" element={<WallOfFame />} />
        </Routes>
        {symbol && (
          <img
            className="symbol symbol--right"
            src={symbolImages[symbol] || book}
            alt="Page symbol"
          ></img>
        )}
      </main>
      {!isTitlePage && (
        <Menu
          wasHighlighted={wasHighlighted}
          isSolved={isSolved}
          isSpelled={isSpelled}
          isDead={isDead}
          volume={volume}
          handleVolumeChange={handleVolumeChange}
        />
      )}
    </div>
  );
}

export default App;
