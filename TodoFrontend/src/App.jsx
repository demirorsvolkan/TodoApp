import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  
import MainContent from './Content/MainContent'
import Login from './Content/Login/Login'
import PrivateRoute from './Content/PrivateRoute';
import { AuthProvider } from './Content/AuthContext';
import Register from './Content/Register/Register'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
function App() {

  return (
    <>
    <Router>
    <AuthProvider>   
      <Routes>
 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DndProvider backend={HTML5Backend}>
              <MainContent />
                  </DndProvider>
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </AuthProvider>
    </Router>
    </>
  )
}

export default App
