import { useState, useEffect } from "react";
import "./App.css";
import Editor from "@monaco-editor/react";
import Navbar from "./Components/Navbar";

function App() {
  const [userCode, setUserCode] = useState("");
  const [userLang, setUserLang] = useState("python");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(20);
  const [terminalLines, setTerminalLines] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const options = { fontSize: fontSize };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  function startExecution() {
    setTerminalLines([]);
    setWaitingForInput(false);
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ code: userCode, language: userLang }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "output") {
        setTerminalLines((prev) => [...prev, data.line]);
      } else if (data.type === "input_request") {
        setWaitingForInput(true);
        setTerminalLines((prev) => [...prev, "Waiting for input..."]);
      } else if (data.type === "execution_complete") {
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  function handleInput(event) {
    if (event.key === "Enter" && socket && waitingForInput) {
      socket.send(JSON.stringify({ input: currentInput }));
      setTerminalLines((prev) => [...prev.slice(0, -1), `> ${currentInput}`]);
      setCurrentInput("");
      setWaitingForInput(false);
    }
  }

  return (
    <div className="App">
      <Navbar
        userLang={userLang}
        setUserLang={setUserLang}
        userTheme={userTheme}
        setUserTheme={setUserTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <div className="main">
        <div className="left-container">
          <Editor
            options={options}
            height="calc(100vh - 200px)"
            width="100%"
            theme={userTheme}
            language={userLang}
            defaultLanguage="python"
            defaultValue="# Enter your code here"
            onChange={(value) => setUserCode(value)}
          />
          <button className="run-btn" onClick={startExecution}>
            Run
          </button>
        </div>
        <div className="right-container">
          <h4>Terminal:</h4>
          <div className="terminal-box">
            {terminalLines.map((line, index) => (
              <pre key={index}>{line}</pre>
            ))}
            {waitingForInput && (
              <input
                type="text"
                className="terminal-input"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleInput}
                placeholder="Type input here..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
