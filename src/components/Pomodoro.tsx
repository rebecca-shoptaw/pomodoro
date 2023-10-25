import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { ClipLoader } from "react-spinners";

const Pomodoro = () => {
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [current, setCurrent] = useState("Session");
  const [minsLeft, setMinsLeft] = useState(sessionLength);
  const [secsLeft, setSecsLeft] = useState(0);
  const [paused, setPaused] = useState(true);
  const [mode, setMode] = useState("light");
  const [minimal, setMinimal] = useState(false);
  const [pageLoad, setLoaded] = useState(false);

  const interval = useRef();
  let now = "Session";

  const beep = document.getElementById("beep") as HTMLAudioElement;
  const click = document.getElementById("click") as HTMLAudioElement;
  const error = document.getElementById("error") as HTMLAudioElement;
  const title = document.querySelector("title");

  const portfolio_link = "https://rebecca-shoptaw.github.io/";

  useEffect(() => {
    if (title) {
      title.innerHTML = `${minsLeft.toString().padStart(2, "0")}:${secsLeft
        .toString()
        .padStart(2, "0")} | ${current == "Session" ? "session" : "break"}`;
    }
  }, [minsLeft, secsLeft, current]);

  window.onload = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key == " ") {
        e.preventDefault();
        document.getElementById("start_stop")?.click();
      }
    });
    if (document.getElementById("timer")) {
      setLoaded(true);
    }
  };

  const beepFunc = (action: string) => {
    if (beep) {
      if (action == "play") {
        beep.play();
      } else if (action == "pause") {
        beep.pause();
        beep.load();
      }
    } else window.onload = () => beepFunc(action);
  };

  const playClick = () => {
    if (click) {
      click.play();
    } else window.onload = () => playClick();
  };

  const playError = () => {
    if (error) {
      error.play();
    } else window.onload = () => playError();
  };

  const countDown = (time: number) => {
    let dist = time * 60;
    interval.current = setInterval(() => {
      dist--;
      const mins = Math.floor((dist / 60) % 1000);
      const secs = Math.floor(dist % 60);
      setMinsLeft(mins);
      setSecsLeft(secs);
      if (dist == 0) {
        beepFunc("play");
      }
      if (dist < 0) {
        if (now == "Session") {
          clearInterval(interval.current);
          setMinsLeft(breakLength);
          setSecsLeft(0);
          setCurrent("Break");
          now = "Break";
          countDown(breakLength);
        } else if (now == "Break") {
          clearInterval(interval.current);
          setCurrent("Session");
          setMinsLeft(sessionLength);
          setSecsLeft(0);
          now = "Session";
          countDown(sessionLength);
        }
      }
    }, 1000);
  };

  const handleStartStop = () => {
    playClick();
    if (paused) {
      let length = 0;
      if (current == "Session") {
        length = sessionLength;
      } else if (current == "Break") {
        length = breakLength;
      }
      if (minsLeft == length) {
        countDown(length);
      } else {
        countDown(minsLeft + secsLeft / 60);
      }
      setPaused(false);
    } else if (!paused) {
      clearInterval(interval.current);
      setPaused(true);
    }
  };

  const increment = (type: string, direction: string) => {
    if (paused) {
      let currLength = sessionLength;
      let setFunc = setSessionLength;
      if (type == "Break") {
        currLength = breakLength;
        setFunc = setBreakLength;
      }
      if (direction == "up" && currLength < 60) {
        setFunc(currLength + 1);
        if (current == type) {
          setMinsLeft(currLength + 1);
          setSecsLeft(0);
        }
        playClick();
      } else if (direction == "down" && currLength > 1) {
        setFunc(currLength - 1);
        if (current == type) {
          setMinsLeft(currLength - 1);
          setSecsLeft(0);
        }
        playClick();
      }
    } else playError();
  };

  const handleReset = (action: string) => {
    playClick();
    if (action == "full") {
      setSessionLength(25);
      setBreakLength(5);
      setMinsLeft(25);
      setCurrent("Session");
    } else if (action == "rewind") {
      if (current == "Break") {
        setMinsLeft(breakLength);
      } else setMinsLeft(sessionLength);
    }
    setSecsLeft(0);
    setPaused(true);
    beepFunc("pause");
    clearInterval(interval.current);
  };

  const toggleMode = () => {
    playClick();
    if (mode == "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const toggleMinimal = () => {
    playClick();
    if (minimal) {
      setMinimal(false);
    } else setMinimal(true);
  };

  return (
    <div
      id="container"
      className={`${mode} ${
        paused == false && current == "Session"
          ? "session"
          : paused == false
          ? "break"
          : ""
      } ${minimal ? "minimal" : ""}`}
    >
      {!pageLoad && <ClipLoader id="load-symbol" color={"#666"} size={100} />}
      <Helmet>
        <title>pomodoro</title>
      </Helmet>
      <div id="header">
        <h4 id="title">pomodoro</h4>
        <div id="head-toggles">
          <i
            id="minimalist-toggle"
            className="bi bi-exclude"
            title="Minimal Mode"
            onClick={toggleMinimal}
          ></i>
          <i
            id="mode-toggle"
            className="bi bi-cloud-moon-fill"
            title="Light/Dark Mode"
            onClick={toggleMode}
          ></i>
          <a id="close-btn" href={portfolio_link}>
            <i className="bi bi-x" title="Close" />
          </a>
        </div>
      </div>
      <div
        id="timer"
        className={`d-flex flex-column justify-content-center ${
          !pageLoad ? "unloaded" : ""
        }`}
      >
        {!minimal && (
          <div
            id="time-toggles"
            className="d-flex flex-row justify-content-between"
          >
            <div
              id="session-toggles"
              className="d-flex flex-column align-items-center"
            >
              <div id="session-label">Session Length</div>
              <div className="d-flex flex-row">
                <i
                  id="session-increment"
                  className="bi bi-arrow-up arrow"
                  onClick={() => increment("Session", "up")}
                ></i>
                <div id="session-length">{sessionLength}</div>
                <i
                  id="session-decrement"
                  className="bi bi-arrow-down arrow"
                  onClick={() => increment("Session", "down")}
                ></i>
              </div>
            </div>

            <div
              id="break-toggles"
              className="d-flex flex-column align-items-center"
            >
              <div id="break-label">Break Length</div>
              <div className="d-flex flex-row">
                <i
                  id="break-increment"
                  className="bi bi-arrow-up"
                  onClick={() => increment("Break", "up")}
                ></i>
                <div id="break-length">{breakLength}</div>
                <i
                  id="break-decrement"
                  className="bi bi-arrow-down"
                  onClick={() => increment("Break", "down")}
                ></i>
              </div>
            </div>
          </div>
        )}
        <div
          id="timer-box"
          className={`d-flex flex-column align-items-center ${
            minimal ? "minimal" : ""
          }`}
        >
          <div id="label-box">
            {!minimal && (
              <div
                id="timer-label"
                className={`${
                  paused
                    ? "paused"
                    : !paused && current == "Session"
                    ? "session"
                    : "break"
                } ${mode}`}
              >
                {current}
              </div>
            )}
          </div>
          <div
            id="time-left"
            className={`${
              paused
                ? "paused"
                : !paused && current == "Session"
                ? "session"
                : "break"
            } ${mode}`}
          >
            {minsLeft.toString().padStart(2, "0")}:
            {secsLeft.toString().padStart(2, "0")}
          </div>
          <div
            id="timer-buttons"
            className="d-flex flex-row justify-content-center"
          >
            <span id="start_stop" title="Start/Stop" onClick={handleStartStop}>
              <i className="play bi bi-play"></i>
              <i className="pause bi bi-pause"></i>
            </span>
            <i
              id="rewind"
              title="Rewind"
              className="bi bi-rewind"
              onClick={() => handleReset("rewind")}
            ></i>
            <i
              id="reset"
              title="Reset"
              className="bi bi-arrow-counterclockwise"
              onClick={() => handleReset("full")}
            ></i>
          </div>
        </div>
        {!minimal && (
          <p id="signature">
            designed & coded by <br></br>{" "}
            <a href={portfolio_link} target="_blank" rel="noreferrer">
              rebecca shoptaw
            </a>
          </p>
        )}
        <audio
          id="beep"
          src="https://cdn.pixabay.com/audio/2022/03/24/audio_c3b7430841.mp3"
        ></audio>
        <audio
          id="click"
          src="https://cdn.pixabay.com/audio/2022/02/17/audio_988aaf064c.mp3"
        ></audio>
        <audio
          id="error"
          src="https://directory.audio/media/fc_local_media/audio_preview/click-error.mp3"
        ></audio>
      </div>
    </div>
  );
};

export default Pomodoro;
