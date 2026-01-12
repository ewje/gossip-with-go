import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import { Routes, Route } from 'react-router'
import Register from './components/Register'
import { CssBaseline } from '@mui/material'
import Topics from './components/Topics'
import Topic from './components/Topic'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/topics" element={<Topics />} />

      <Route path="/topics/:topicId" element={<Topic />} />
    </Routes>
  )
}

export default App
