import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListView from './components/ListView';
import EditView from './components/EditView';
import DeletedEntities from './components/DeleteEntities';
import Sidebar from './components/Sidebar'; // Import Sidebar component
import { Toaster } from 'sonner';
import './styles.css'

const App = () => {
  return (
    <Router>
     <Toaster
  position="top-center"
  richColors
  toastOptions={{
    className: "animate-fade-in-down",
    duration: 5000,  // Adjust toast display duration
    style: {
      fontSize: "18px", // Increase font size
      padding: "12px 20px", // Add more padding for a bigger toast
      borderRadius: "8px", // Rounded corners
      background: "linear-gradient(135deg, #6e7bff, #8e9eff)", // Custom background gradient
      color: "#fff", // Text color
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Shadow effect for a more modern look
      transition: "transform 0.3s ease-in-out", // Smooth transition for animation
    },
    // Optional: You can add different animation effects here
    animation: "fadeInDown 0.5s ease-in-out", // Custom fade-in-down animation
  }}
/>

      <div className="app-container">
        <Sidebar /> {/* Sidebar on the left */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/add" element={<EditView />} />
            <Route path="/edit/:id" element={<EditView />} />
            <Route path="/deleted" element={<DeletedEntities />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
