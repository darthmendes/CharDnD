import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App.tsx";
// import CharacterForm from "./features/character-sheet/CharacterCreatorForm.tsx";
import CharacterDisplay from "./features/character-sheet/CharacterSheet.tsx";
import CharacterCreator from "./features/character-creator/CharacterCreator.tsx";
import ItemDisplay from "./features/Items/ItemDisplay.tsx";
import ItemForm from "./features/Items/ItemCreator/ItemForm.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import MonsterForm from "./features/Monsters/MonsterCreator/MonsterForm.tsx";
import MonsterDisplay from "./features/Monsters/MonsterDisplay.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="characters/creator" element={<CharacterCreator />} />
        <Route path="characters/:id" element={<CharacterDisplay />} />
        <Route path="items/creator" element={<ItemForm />} />
        <Route path="items/:id" element={<ItemDisplay />} />
        <Route path="monsters/creator" element={<MonsterForm />} />
        <Route path="monsters/:id" element={<MonsterDisplay />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
