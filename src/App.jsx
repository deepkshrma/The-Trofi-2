import { useState } from "react";
import Allroutes from "./Allroutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Allroutes />
    </>
  );
}

export default App;
