import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Import Sidebar CSS

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li><Link to="/">List View</Link></li>
        <li><Link to="/add">Add Entity</Link></li>
        <li><Link to="/deleted">Deleted Entities</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
