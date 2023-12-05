// src/App.tsx
import React from "react";
import "./App.css";
import RacismEventList from "./components/RacismEventList";

const App: React.FC = () => {
  return (
    <div className="App">
      <main>
        <RacismEventList />
      </main>
    </div>
  );
};

export default App;
