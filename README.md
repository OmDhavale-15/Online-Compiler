# Interactive Online Compiler (React + Vite)

## Overview
This project is an interactive online compiler built using **React + Vite**. It features a code editor using **Monaco Editor**, a WebSocket-based execution environment, and a terminal that executes code line by line, handling user inputs dynamically.

## Features
- **Supports multiple programming languages** (Python, C, C++, Java, JavaScript)
- **Live code execution** via WebSocket
- **Interactive terminal** for handling user input
- **Customizable theme and font size**

## Tech Stack
- **Frontend**: React, Vite, Monaco Editor, WebSocket
- **Backend**: Node.js, Express, WebSockets, Piston API for code execution

## Installation

### Prerequisites
Make sure you have **Node.js** installed.

### Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/OmDhavale-15/Online-Compiler.git
   cd online-compiler
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```
4. **Start the backend server:**
   ```sh
   cd online-compiler
   node index.js
   ```

## Usage
1. Open the app in the browser.
2. Write your code in the editor.
3. Click the **Run** button to execute.
4. If your code requires input, the terminal will pause execution and wait for your input.
5. Press **Enter** after typing the input to continue execution.

## Folder Structure
```
interactive-compiler/
├── src/
│   ├── Components/
│   │   ├── Navbar.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
├
├── index.js  # WebSocket Server
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## Backend API
The backend uses WebSockets for real-time communication.
- **Endpoint:** `ws://localhost:8000`
- **Message Format:**
  - **To start execution:** `{ code: "<source_code>", language: "<language>" }`
  - **To send input:** `{ input: "<user_input>" }`
  - **Response Types:**
    - `{ type: "output", line: "<output_text>" }`
    - `{ type: "input_request" }`
    - `{ type: "execution_complete" }`

## Contributing
Feel free to fork the repository and submit a pull request!

## License
MIT License

