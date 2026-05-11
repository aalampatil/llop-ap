import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/header";
import { BuilderPage } from "./pages/builder-page";
import { DashboardPage } from "./pages/dashboard-page";
import { HomePage } from "./pages/home-page";
import { PublicPollPage } from "./pages/public-poll-page";
import "./App.css";

function App() {
  return (
    <div className="app-shell min-h-screen text-foreground">
      <Header />
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<BuilderPage />} path="/builder" />
        <Route element={<DashboardPage />} path="/dashboard/:pollId" />
        <Route element={<PublicPollPage />} path="/p/:slug" />
      </Routes>
    </div>
  );
}

export default App;
