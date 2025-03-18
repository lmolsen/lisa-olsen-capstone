import "./StoryPage.scss";

import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Filter } from "bad-words";
import { postName } from "../../utils/apiUtils";

import rune from "../../assets/images/rune.png";
import pageData from "../../data/pageData.json";
import ScrollIndicator from "../../components/ScrollIndicator/ScrollIndicator";

import Slide from "../../components/Slide/Slide";
import Light from "../../components/Light/Light";
import Dice from "../../components/Dice/Dice";
import Cube from "../../components/Cube/Cube";
import Sequence from "../../components/Sequence/Sequence";

export default function StoryPage({
  isDead,
  setIsDead,
  setIsSolved,
  isSolved,
  setIsSpelled,
  setIsHighlighted,
  setWasHighlighted,
  setSymbol,
}) {
  const { pageId } = useParams();
  const pageContent = pageData[pageId] || {};

  const [puzzleSolved, setPuzzleSolved] = useState(pageContent.puzzleSolved);
  const [isListening, setIsListening] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);
  const [feat, setFeat] = useState(false);
  const correctAnswer = ["root root", "route route", "rootroot", "routeroute"];
  const alternateAnswer = ["syntax", "sin tax", "send text", "send tax"];
  const [name, setName] = useState("");

  const filter = new Filter();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setPuzzleSolved(false);
    setSymbol(pageContent.symbol);
    if (feat && location.pathname === "/page9") {
      setSymbol("treasure");
    }
  }, [location]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : "";

      if (selectedText.includes("rootroot")) {
        setPuzzleSolved(true);
        setIsHighlighted(true);
        setWasHighlighted(true);
      } 
      else {
        setIsHighlighted(false);
      }
    };

    document.addEventListener("selectionchange", handleSelection);

    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, [setIsHighlighted]);

  useEffect(() => {
    if (pageContent.dead || (pageContent.drop && !feat)) {
      setIsDead(true);
    }
  }, [setIsDead, pageContent]);

  const handleInput = (e) => {
    const value = e.target.value.trim();

    if (
      pageContent.form &
      (value === "Edoc'sv" ||
        value === "edoc'sv" ||
        value === "edocsv" ||
        value === "Edocsv")
    ) {
      setPuzzleSolved(true);
    } else if (
      pageContent.cube &
      (value === "syntax" || value === "Syntax" || value === "send tax")
    ) {
      setPuzzleSolved(true);
      setIsSpelled(true);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setIsSilent(false);
      setHasSpoken(false);
    };

    setTimeout(() => {
      recognition.stop();
      setIsListening(false);

      if (!hasSpoken) {
        setIsSilent(true);
      }
    }, 5000);

    recognition.onresult = (event) => {
      let result = event.results[0][0].transcript.trim().toLowerCase();

      const cleanedTranscript = filter.clean(result);

      if (result) {
        setIsSilent(false);
        setHasSpoken(true);
        setTranscript(cleanedTranscript);
      }

      if (correctAnswer.includes(result) || alternateAnswer.includes(result)) {
        setPuzzleSolved(true);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (filter.isProfane(name)) {
      alert("Let's be adults here. Try again.");
      return;
    }

    try {
      const accomplishment = pageContent.accomplishment;
      await postName(accomplishment, name);
      navigate("/wall-of-fame");
      setName("");
    } catch (error) {
      console.error("There was a problem with submitting the form.", error);
    }
  };

  if (!pageContent) {
    return <div>Page not found</div>;
  }

  return (
    <div className="page">
      <div className="page__story">
        {pageContent.text && pageContent.text.length > 0 ? (
          pageContent.text.map((paragraph, index) => (
            <p key={index} className="page__text">
              {paragraph}
            </p>
          ))
        ) : (
          <p>No content available for this page.</p>
        )}
      </div>

      {pageContent.slide && (
        <div className="slide ignore">
          <Slide
            setPuzzleSolved={setPuzzleSolved}
            setIsSolved={setIsSolved}
            isSolved={isSolved}
          />
        </div>
      )}

      {pageContent.highlight && (
        <div className="paper ignore">
          <p className="paper__text">
            Passphrase:<span className="paper__secret">rootroot</span>
          </p>
        </div>
      )}

      {pageContent.form && (
        <div className="form ignore">
          <img className="form__image" src={rune} alt="Magic rune" />
          <input
            onChange={handleInput}
            className="form__input"
            placeholder="Write the name of the rune."
            disabled={puzzleSolved}
          ></input>
        </div>
      )}

      {pageContent.light && (
        <div className="light ignore">
          <Light
            puzzleSolved={puzzleSolved}
            setPuzzleSolved={setPuzzleSolved}
          />
        </div>
      )}

      {pageContent.portal && (
        <div className="sequence ignore">
          <Sequence
            puzzleSolved={puzzleSolved}
            setPuzzleSolved={setPuzzleSolved}
          />
        </div>
      )}
      {pageContent.dice && (
        <div className="dice ignore">
          <Dice
            puzzleSolved={puzzleSolved}
            setPuzzleSolved={setPuzzleSolved}
            setFeat={setFeat}
          />
        </div>
      )}

      {pageContent.cube && (
        <div className="cubic">
          <Cube />
          <input
            placeholder="Enter the word on the cube."
            onChange={handleInput}
            className="cubic__input ignore"
            disabled={puzzleSolved}
          ></input>
        </div>
      )}

      {pageContent.speak && (
        <div className="speak ignore">
          <button
            className="speak__button"
            onClick={startListening}
            disabled={isListening || puzzleSolved}
          >
            {puzzleSolved ? "Accepted" : isListening ? "Listening..." : "Speak"}
          </button>
          <p className="page__result">
            {`You have spoken: ${
              transcript
                ? transcript.toLowerCase() === "route route"
                  ? "rootroot."
                  : transcript.toLowerCase() === "send text"
                  ? "syntax."
                  : transcript + ". Nothing happens."
                : "..."
            }`}
          </p>

          {isSilent && !puzzleSolved && !hasSpoken && !transcript ? (
            <p className="page__prompt">Cat got your tongue?</p>
          ) : (
            ""
          )}
        </div>
      )}

      {puzzleSolved && pageContent.solvedText && (
        <p className="page__text page__text--solved">
          {pageContent.solvedText}
        </p>
      )}

      {pageContent.riddle && (
        <p className="page__riddle">
          "No wings but tail have I / Yet still I travel through the sky."
        </p>
      )}

      <div className="page__choices">
        <p className="page__prompt">{pageContent.prompt}</p>
        {(puzzleSolved ? pageContent.solvedChoices : pageContent.choices)?.map(
          (choice, index) => (
            <Link key={index} to={choice.link}>
              <p
                className={`page__choice ${
                  puzzleSolved ? "page__choice--solved" : ""
                } `}
              >
                {choice.text}
              </p>
            </Link>
          )
        )}
      </div>

      {pageContent.speak && puzzleSolved && (
        <div className="page__choices">
          {correctAnswer.includes(transcript) && (
            <Link to="/page15">
              <p className="page__choice page__choice--solved">
                [Proceed to the ultimate treasure room.]
              </p>
            </Link>
          )}
          {alternateAnswer.includes(transcript) && (
            <Link to="/page9">
              <p className="page__choice page__choice--solved">
                [Proceed to the treasure room.]
              </p>
            </Link>
          )}
        </div>
      )}

      {pageContent.drop && (
        <>
          <p className="page__text">
            You fall a long way down, though it only takes a few moments.
            {feat
              ? " OW! You land on a pile of sacks. They're not exactly soft, but they're softer than the stone floor. You've survived the fall with magical boots in hand. Rubbing your sore tailbone, you head back out the way you came."
              : " In the instant before you hit the ground, you realize you really should have moved that pile of sacks earlier. SPLAT!"}
          </p>
          <p className="page__prompt">
            {feat
              ? "Congratulations! From now on, you'll be travelling in style!"
              : "You die."}
          </p>
        </>
      )}

      {pageContent.accomplishment && !isDead && (
        <form className="name" onSubmit={handleFormSubmit}>
          <input
            className="name__input ignore"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name for the Wall of Fame."
            maxLength={50}
            disabled={puzzleSolved}
          ></input>
          <button className="name__button ignore" type="Submit">
            Submit
          </button>
        </form>
      )}

      <ScrollIndicator/>
    </div>
  );
}
