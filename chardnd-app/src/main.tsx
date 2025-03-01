import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App.tsx";
import CharacterForm from "./Character/CharacterCreatorForm.tsx";
import CharacterDisplay from "./Character/CharacterDisplay.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
      <Route path="characters/creator" element={<CharacterForm />} />
      <Route path="characters/:id" element={<CharacterDisplay />} />
    </Routes>
  </BrowserRouter>
);
