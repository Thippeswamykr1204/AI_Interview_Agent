import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { InterviewProvider } from "./context/InterviewContext";

export function App() {
  return (
    <InterviewProvider>
      <RouterProvider router={router} />
    </InterviewProvider>
  );
}