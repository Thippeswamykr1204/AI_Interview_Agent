import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SetupPage } from "./pages/SetupPage";
import { InterviewPage } from "./pages/InterviewPage";
import { ResultsPage } from "./pages/ResultsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/setup",
    element: <SetupPage />,
  },
  {
    path: "/interview/:sessionId",
    element: <InterviewPage />,
  },
  {
    path: "/results/:sessionId",
    element: <ResultsPage />,
  },
]);