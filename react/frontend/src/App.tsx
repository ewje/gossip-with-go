import React from 'react';
import logo from './logo.svg';
import './App.css';

// src/App.tsx
import { useEffect, useState } from 'react'


interface Topic {
  id: number;
  name: string;
  description: string;
  user_id: number;
}

function App() {
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/topics')
        const result = await response.json()
        
        console.log("Got data:", result)
        
        setTopics(result.payload?.data || result) 
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }

    fetchTopics()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Forum Topics</h1>
      
      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>
            {}
            <strong>{topic.name}</strong>
            <p>{topic.description}</p>
            <small>Author ID: {topic.user_id}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App