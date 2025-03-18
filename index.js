import express from "express";
import cors from "cors";
import Axios from "axios";
import { WebSocketServer } from "ws";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.executionState = { inputBuffer: null, waitingForInput: false };

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.code) {
      ws.executionState.inputBuffer = null;
      ws.executionState.waitingForInput = false;
      await executeCode(ws, data.code, data.language);
    } else if (data.input && ws.executionState.waitingForInput) {
      ws.executionState.inputBuffer = data.input;
      ws.executionState.waitingForInput = false;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});


async function executeCode(ws, code, language) {
  let languageMap = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "c++", version: "10.2.0" },
    python: { language: "python", version: "3.10.0" },
    java: { language: "java", version: "15.0.2" },
    javascript: { language: "javascript", version: "ES6" },
  };

  if (!languageMap[language]) {
    ws.send(JSON.stringify({ type: "output", line: "Unsupported language" }));
    return;
  }

  let stdinBuffer = [];
  ws.executionState = { inputBuffer: null, waitingForInput: false };

  // Check if input is required
  if (
    code.includes("scanf") ||
    code.includes("cin") ||
    code.includes("input(")
  ) {
    ws.send(JSON.stringify({ type: "input_request" }));
    ws.executionState.waitingForInput = true;

    while (ws.executionState.waitingForInput) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    stdinBuffer.push(ws.executionState.inputBuffer);
    ws.executionState.inputBuffer = null;
  }

  let requestData = {
    language: languageMap[language].language,
    version: languageMap[language].version,
    files: [{ name: "main", content: code }],
    stdin: stdinBuffer.join("\n"),
  };

  try {
    const response = await Axios.post(
      "https://emkc.org/api/v2/piston/execute",
      requestData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    ws.send(
      JSON.stringify({
        type: "output",
        line: response.data.run.stdout || response.data.run.stderr,
      })
    );
  } catch (error) {
    console.error(error);
    ws.send(JSON.stringify({ type: "output", line: "Execution error" }));
  }

  ws.send(JSON.stringify({ type: "execution_complete" }));
}

// Function to compile a single line of code
async function compileCode(code, language) {
  let languageMap = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "c++", version: "10.2.0" },
    python: { language: "python", version: "3.10.0" },
    java: { language: "java", version: "15.0.2" },
    javascript: { language: "javascript", version: "ES6" },
  };

  if (!languageMap[language]) {
    return "Unsupported language";
  }

  let data = {
    language: languageMap[language].language,
    version: languageMap[language].version,
    files: [{ name: "main", content: code }],
    stdin: "",
  };

  try {
    const response = await Axios.post("https://emkc.org/api/v2/piston/execute", data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.run.stdout || response.data.run.stderr;
  } catch (error) {
    console.error(error);
    return "Execution error";
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
