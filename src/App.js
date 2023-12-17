import { Navigate, Routes, Route } from "react-router-dom";
import GlobalStyle from "./global.styles";
import { Grid } from "./Grid";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
      }}
    >
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Grid />} exact />
      </Routes>
    </div>
  );
}

export default App;
