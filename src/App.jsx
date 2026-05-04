import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <div className="container">
        <h1>Deutsch Lernen · A1/A2 Vocab</h1>
        <p>German Vocabulary Learning App</p>
        <button onClick={() => setCount(count + 1)}>
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
