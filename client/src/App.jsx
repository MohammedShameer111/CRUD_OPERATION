import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListView from './components/ListView';
import EditView from './components/EditView';
import DeletedEntities from './components/DeleteEntities';


const App = () => {
  return (
    <Router>
      <nav>
        
     
        <Link to="/deleted">Deleted Entities</Link> {/* Add a route for DeletedEntities */}
      </nav>
      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/add" element={<EditView />} />
        <Route path="/edit/:id" element={<EditView />} />
        <Route path="/deleted" element={<DeletedEntities />} /> {/* Add route for DeletedEntities */}
      </Routes>
    </Router>
  );
};

export default App;
