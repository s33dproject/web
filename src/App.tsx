import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Manifest from "./pages/Manifest";
import Gallery from "./pages/Gallery";
import Void from "./pages/Void";
import Sketches from "./pages/Sketches";
import Run from "./pages/Run";

const showPlayground = import.meta.env.DEV;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="manifest" element={<Manifest />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="v0id" element={<Void />} />
        {showPlayground && (
          <>
            <Route path="sketches" element={<Sketches />} />
            <Route path="run/:type/:name/*" element={<Run />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
