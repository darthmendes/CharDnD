import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App.tsx";
import CharacterForm from "./features/character-sheet/CharacterCreatorForm.tsx";
import CharacterDisplay from "./features/character-sheet/CharacterSheet.tsx";
import ItemDisplay from "./features/Items/ItemDisplay.tsx";
import ItemForm from "./features/Items/ItemForm.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
      <Route path="characters/creator" element={<CharacterForm />} />
      <Route path="characters/:id" element={<CharacterDisplay />} />
      <Route path="items/creator" element={<ItemForm />} />
      <Route path="items/:id" element={<ItemDisplay />} />
    </Routes>
  </BrowserRouter>
);
