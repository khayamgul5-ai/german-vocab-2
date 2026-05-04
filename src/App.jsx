import { useState, useEffect } from 'react'
import { vocabularyData } from './vocabularyData'
import './App.css'

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, learning, learned
  const [stats, setStats] = useState({ show: false })
  const [wordStatus, setWordStatus] = useState({})

  // Initialize word statuses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wordStatus')
    if (saved) {
      setWordStatus(JSON.parse(saved))
    }
  }, [])

  // Save word statuses to localStorage
  useEffect(() => {
    localStorage.setItem('wordStatus', JSON.stringify(wordStatus))
  }, [wordStatus])

  // Filter vocabulary based on search and filter
  const filteredVocabulary = vocabularyData.filter(word => {
    const matchesSearch = 
      word.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english.toLowerCase().includes(searchTerm.toLowerCase())
    
    const status = wordStatus[word.german] || 'not-started'
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'learning' && status === 'learning') ||
      (filter === 'learned' && status === 'learned')
    
    return matchesSearch && matchesFilter
  })

  const currentWord = filteredVocabulary[currentIndex]

  // Navigation functions
  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
    setIsFlipped(false)
  }

  const handleNext = () => {
    setCurrentIndex(Math.min(filteredVocabulary.length - 1, currentIndex + 1))
    setIsFlipped(false)
  }

  const markAsLearning = () => {
    if (currentWord) {
      setWordStatus(prev => ({
        ...prev,
        [currentWord.german]: 'learning'
      }))
      handleNext()
    }
  }

  const markAsLearned = () => {
    if (currentWord) {
      setWordStatus(prev => ({
        ...prev,
        [currentWord.german]: 'learned'
      }))
      handleNext()
    }
  }

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setWordStatus({})
      setCurrentIndex(0)
      setIsFlipped(false)
      setFilter('all')
      setSearchTerm('')
    }
  }

  // Calculate statistics
  const total = vocabularyData.length
  const learned = vocabularyData.filter(w => wordStatus[w.german] === 'learned').length
  const learning = vocabularyData.filter(w => wordStatus[w.german] === 'learning').length
  const notStarted = total - learned - learning
  const progress = (learned / total) * 100

  // Handle search with filter reset
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  if (filteredVocabulary.length === 0 && searchTerm) {
    return (
      <div className="app">
        <div className="header">
          <h1>🇩🇪 Deutsch Lernen</h1>
          <p className="subtitle">A1/A2 Vocabulary Learning</p>
        </div>
        <div className="container">
          <div className="controls-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search German or English..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="empty-state">
            <p>❌ No words found for "{searchTerm}"</p>
            <button className="btn btn-reset" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentWord) {
    return (
      <div className="app">
        <div className="header">
          <h1>🇩🇪 Deutsch Lernen</h1>
          <p className="subtitle">A1/A2 Vocabulary Learning</p>
        </div>
        <div className="container">
          <div className="empty-state">
            <p>📚 All words completed! Great job!</p>
            <button className="btn btn-reset" onClick={resetProgress}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentStatus = wordStatus[currentWord.german] || 'not-started'
  const statusEmoji = currentStatus === 'learning' ? '📖' : currentStatus === 'learned' ? '✓' : '○'

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>🇩🇪 Deutsch Lernen</h1>
        <p className="subtitle">A1/A2 Vocabulary Learning with Spaced Repetition</p>
      </div>

      <div className="container">
        {/* Statistics */}
        <div className="stats-section">
          <button className="stats-toggle" onClick={() => setStats(prev => ({ show: !prev.show }))}>
            {stats.show ? '📊 Hide Stats' : '📊 Show Stats'}
          </button>
          {stats.show && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{total}</div>
                <div className="stat-label">Total Words</div>
              </div>
              <div className="stat-card learned">
                <div className="stat-number">{learned}</div>
                <div className="stat-label">Learned</div>
              </div>
              <div className="stat-card learning">
                <div className="stat-number">{learning}</div>
                <div className="stat-label">Learning</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{notStarted}</div>
                <div className="stat-label">Not Started</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="controls-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search German or English..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All ({filteredVocabulary.length})
            </button>
            <button
              className={`filter-btn ${filter === 'learning' ? 'active' : ''}`}
              onClick={() => handleFilterChange('learning')}
            >
              📖 Learning
            </button>
            <button
              className={`filter-btn ${filter === 'learned' ? 'active' : ''}`}
              onClick={() => handleFilterChange('learned')}
            >
              ✓ Learned
            </button>
          </div>
        </div>

        {/* Flashcard Section */}
        <div className="card-section">
          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            Progress: {learned}/{total} • Card: {currentIndex + 1}/{filteredVocabulary.length}
          </div>

          {/* Flip Card */}
          <div className="flip-card" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              <div className="flip-card-front">
                <div className="card-category">{currentWord.type.toUpperCase()}</div>
                <div className="card-word">{currentWord.german}</div>
                <div className="card-hint">Click to reveal translation</div>
              </div>
              <div className="flip-card-back">
                <div className="card-category">{currentWord.type.toUpperCase()}</div>
                <div className="card-english">{currentWord.english}</div>
                <div className="card-hint">{currentWord.category}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-prev"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn btn-learning"
              onClick={markAsLearning}
            >
              📖 Learning
            </button>
            <button 
              className="btn btn-learned"
              onClick={markAsLearned}
            >
              ✓ Learned
            </button>
            <button 
              className="btn btn-next"
              onClick={handleNext}
              disabled={currentIndex === filteredVocabulary.length - 1}
            >
              Next →
            </button>
          </div>

          {/* Reset Button */}
          <button className="btn btn-reset" onClick={resetProgress}>
            🔄 Reset All Progress
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Keep practicing! 💪 Spaced repetition helps you retain vocabulary better.</p>
      </div>
    </div>
  )
}

export default App
