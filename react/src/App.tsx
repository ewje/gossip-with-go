import './App.css'
import Login from './components/Login'
import { Routes, Route } from 'react-router'
import Register from './components/Register'
import Topics from './components/Topics'
import Topic from './components/Topic'
import Post from './components/Post'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/topics" element={<Topics />} />

      <Route path="/topics/:topicId" element={<Topic />} />

      <Route path="/posts/:postId" element={<Post />} />
    </Routes>
  )
}

export default App
