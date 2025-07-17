import { useState, useEffect, useRef } from 'react'
import './App.css'
import Portfolio from './Portfolio';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userName, setUserName] = useState('')
  const [step, setStep] = useState(1)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [socials, setSocials] = useState({ instagram: '', facebook: '', youtube: '', linkedin: '', tiktok: '', bandcamp: '', other: '' });
  const [mediaFiles, setMediaFiles] = useState([])
  const [bioImage, setBioImage] = useState(null)
  const [aboutInput, setAboutInput] = useState('')
  const [generatedBio, setGeneratedBio] = useState('')
  const [bioLoading, setBioLoading] = useState(false)
  const [bioError, setBioError] = useState('')
  const bioImageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [customGenre, setCustomGenre] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);

  const genres = [
    'Visual Art',
    'Dance',
    'Music',
    'Photography',
    'Film',
    'Literature',
    'Theatre',
    'Digital Art',
    'Sculpture',
    'Fashion',
    'Other'
  ]

  function handleGenreChange(genre) {
    if (genre === 'Other') {
      if (selectedGenres.includes('Other')) {
        setSelectedGenres(prev => prev.filter(g => g !== 'Other'));
        setCustomGenre('');
      } else {
        setSelectedGenres(prev => [...prev, 'Other']);
      }
    } else {
      setSelectedGenres(prev =>
        prev.includes(genre)
          ? prev.filter(g => g !== genre)
          : [...prev, genre]
      );
    }
  }

  function handleSocialChange(e) {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  }

  function handleMediaChange(e) {
    const newFiles = Array.from(e.target.files)
    setMediaFiles(prev => [...prev, ...newFiles])
    // Reset the input value so the same file can be selected again if needed
    e.target.value = ''
  }

  function handleAddMoreClick() {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  function handleBioImageChange(e) {
    const file = e.target.files[0]
    setBioImage(file)
    e.target.value = ''
  }

  function handleBioImageClick() {
    if (bioImageInputRef.current) bioImageInputRef.current.click()
  }

  function handleNext() {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else if (step === 3) setStep(4)
    else if (step === 4) setStep(5)
    else if (step === 5) setStep(6)
    else if (step === 6) setStep(7)
  }

  function handleBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
    else if (step === 5) setStep(4)
    else if (step === 6) setStep(5)
    else if (step === 7) setStep(6)
  }

  async function handleGenerateBio() {
    setBioLoading(true)
    setBioError('')
    setGeneratedBio('')
    try {
      const res = await fetch('http://localhost:5001/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutInput })
      })
      if (!res.ok) throw new Error('Failed to generate bio')
      const data = await res.json()
      setGeneratedBio(data.bio)
    } catch (err) {
      setBioError('Failed to generate bio. Please try again.')
    } finally {
      setBioLoading(false)
    }
  }

  function handleCloseModal() {
    setShowModal(false)
    setStep(1)
    setUserName('')
    setSelectedGenres([])
  }

  // Helper to convert a File to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSavePortfolio() {
    // Convert bioImage and mediaFiles to base64
    let bioImageBase64 = null;
    if (bioImage) {
      bioImageBase64 = await fileToBase64(bioImage);
    }
    const mediaFilesBase64 = await Promise.all(
      mediaFiles.map(async file => ({
        name: file.name,
        type: file.type,
        base64: await fileToBase64(file)
      }))
    );
    let genresToSave = selectedGenres.slice();
    if (genresToSave.includes('Other') && customGenre.trim()) {
      genresToSave = genresToSave.filter(g => g !== 'Other');
      genresToSave.push(customGenre.trim());
    }
    const data = {
      userName,
      tagline: '',
      bioImage: bioImageBase64,
      genres: genresToSave,
      socials,
      mediaFiles: mediaFilesBase64,
      generatedBio
    };
    setPortfolioData(data);
    localStorage.setItem('artseePortfolio', JSON.stringify(data));
    alert('Portfolio saved!');
  }

  function handleDownloadPortfolio() {
    const data = portfolioData || JSON.parse(localStorage.getItem('artseePortfolio'));
    if (!data) return alert('No portfolio to download!');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artsee-portfolio.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleViewPortfolio() {
    const data = portfolioData || JSON.parse(localStorage.getItem('artseePortfolio'));
    if (!data) return alert('No saved portfolio!');
    setPortfolioData(data);
    setShowPortfolio(true);
  }

  function handleBackToMain() {
    setShowPortfolio(false);
  }

  // Close modal on Esc or click outside
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setShowModal(false)
    }
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false)
      }
    }
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModal])

  // Helper to limit words
  function getWordLimitedText(text, limit) {
    const words = text.split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/artsee-logo.png" alt="Artsee Logo" className="logo-inline" />
            <span className="brand-name">Artsee</span>
          </div>
          <div className="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="cta-btn secondary nav-btn" onClick={handleViewPortfolio}>View My Portfolio</button>
            <button className="login-btn nav-btn">Login</button>
          </div>
          <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <button className="cta-btn secondary nav-btn" onClick={() => { setIsMenuOpen(false); handleViewPortfolio(); }}>View My Portfolio</button>
            <button className="login-btn nav-btn" onClick={() => setIsMenuOpen(false)}>Login</button>
          </div>
        )}
      </nav>
      {/* Main Content */}
      {showPortfolio ? (
        <div className="portfolio-wrapper">
          <button className="cta-btn secondary" onClick={handleBackToMain} style={{ margin: '1rem' }}>Back</button>
          <Portfolio data={portfolioData} onDownload={handleDownloadPortfolio} onSave={handleSavePortfolio} />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-container">
              <div className="hero-content">
                <h1 className="hero-title">
                  Showcase Your Art with
                  <span className="gradient-text"> AI-Powered</span> Portfolios
                </h1>
                <p className="hero-subtitle">
                  Create stunning, professional portfolios that showcase your artistic vision. 
                  Our AI-assisted portfolio builder helps you present your work in the most compelling way.
                </p>
                <div className="hero-buttons">
                  <button className="cta-btn primary" onClick={() => setShowModal(true)}>Get Started</button>
                  <button className="cta-btn secondary">View Examples</button>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-image-placeholder">
                  <div className="portfolio-preview">
                    <div className="preview-item"></div>
                    <div className="preview-item"></div>
                    <div className="preview-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="features">
            <div className="container">
              <h2 className="section-title">Why Choose Artsee?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🎨</div>
                  <h3>AI-Powered Curation</h3>
                  <p>Our AI helps you select and arrange your best work for maximum impact.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Lightning Fast</h3>
                  <p>Create professional portfolios in minutes, not hours.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📱</div>
                  <h3>Responsive Design</h3>
                  <p>Your portfolio looks perfect on every device and screen size.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Secure & Private</h3>
                  <p>Your artwork is protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <div className="container">
              <h2>Ready to Showcase Your Art?</h2>
              <p>Join thousands of artists who trust Artsee to present their work professionally.</p>
              <button className="cta-btn primary large">Start Building Your Portfolio</button>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <img src="/artsee-logo.png" alt="Artsee" className="logo" />
                  <p>Empowering artists with AI-driven portfolio creation.</p>
                </div>
                <div className="footer-links">
                  <div className="footer-column">
                    <h4>Product</h4>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#examples">Examples</a>
                  </div>
                  <div className="footer-column">
                    <h4>Company</h4>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                    <a href="#careers">Careers</a>
                  </div>
                  <div className="footer-column">
                    <h4>Support</h4>
                    <a href="#help">Help Center</a>
                    <a href="#docs">Documentation</a>
                    <a href="#community">Community</a>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; 2024 Artsee. All rights reserved.</p>
              </div>
            </div>
          </footer>

          {/* Modal for AI Portfolio Builder - Step 1, 2, 3, 4 */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal" ref={modalRef}>
                <div className="modal-content-scroll">
                  {step === 1 && (
                    <>
                      <h2>Let's Get Started!</h2>
                      <label htmlFor="userNameInput">What is your name or pseudonym?</label>
                      <input
                        id="userNameInput"
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        placeholder="Enter your name or pseudonym"
                        autoFocus
                      />
                      <div className="modal-actions">
                        <button
                          className="cta-btn primary"
                          onClick={handleNext}
                          disabled={!userName.trim()}
                        >
                          Next
                        </button>
                        <button className="cta-btn secondary" onClick={handleCloseModal}>
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h2>Select Your Genre(s)</h2>
                      <div className="genre-list">
                        {genres.map(genre => (
                          <label key={genre} className="genre-checkbox">
                            <input
                              type="checkbox"
                              value={genre}
                              checked={selectedGenres.includes(genre)}
                              onChange={() => handleGenreChange(genre)}
                            />
                            {genre}
                          </label>
                        ))}
                      </div>
                      {selectedGenres.includes('Other') && (
                        <div style={{ margin: '1rem 0' }}>
                          <textarea
                            placeholder="Enter your custom genre(s)"
                            value={customGenre}
                            onChange={e => setCustomGenre(e.target.value)}
                            rows={2}
                            style={{ width: '100%', borderRadius: 8, border: '1px solid #c7d2fe', padding: '0.7rem', fontSize: '1rem' }}
                          />
                          <div style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: 4 }}>
                            This will be added to your portfolio as a genre.
                          </div>
                        </div>
                      )}
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={handleNext}
                          disabled={selectedGenres.length === 0 || (selectedGenres.includes('Other') && !customGenre.trim())}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h2>Share Your Social Media Handles</h2>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'max-content 1fr',
                        gap: '1.2rem 1.5rem',
                        alignItems: 'center',
                        margin: '1.5rem 0'
                      }}>
                        <label htmlFor="instagramInput" style={{fontWeight: 500, color: '#374151'}}>Instagram</label>
                        <input
                          id="instagramInput"
                          name="instagram"
                          type="text"
                          value={socials.instagram}
                          onChange={handleSocialChange}
                          placeholder="Instagram link or handle"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="facebookInput" style={{fontWeight: 500, color: '#374151'}}>Facebook</label>
                        <input
                          id="facebookInput"
                          name="facebook"
                          type="text"
                          value={socials.facebook}
                          onChange={handleSocialChange}
                          placeholder="Facebook link"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="youtubeInput" style={{fontWeight: 500, color: '#374151'}}>YouTube</label>
                        <input
                          id="youtubeInput"
                          name="youtube"
                          type="text"
                          value={socials.youtube}
                          onChange={handleSocialChange}
                          placeholder="YouTube link"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="linkedinInput" style={{fontWeight: 500, color: '#374151'}}>LinkedIn</label>
                        <input
                          id="linkedinInput"
                          name="linkedin"
                          type="text"
                          value={socials.linkedin}
                          onChange={handleSocialChange}
                          placeholder="LinkedIn link"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="tiktokInput" style={{fontWeight: 500, color: '#374151'}}>TikTok</label>
                        <input
                          id="tiktokInput"
                          name="tiktok"
                          type="text"
                          value={socials.tiktok}
                          onChange={handleSocialChange}
                          placeholder="TikTok link"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="bandcampInput" style={{fontWeight: 500, color: '#374151'}}>Bandcamp</label>
                        <input
                          id="bandcampInput"
                          name="bandcamp"
                          type="text"
                          value={socials.bandcamp}
                          onChange={handleSocialChange}
                          placeholder="Bandcamp link"
                          style={{ width: '100%' }}
                        />
                        <label htmlFor="otherInput" style={{fontWeight: 500, color: '#374151'}}>Other</label>
                        <input
                          id="otherInput"
                          name="other"
                          type="text"
                          value={socials.other}
                          onChange={handleSocialChange}
                          placeholder="Other handle or link"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={handleNext}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <h2>Upload Your Media</h2>
                      <label htmlFor="mediaInput">Add images or videos from your device</label>
                      <input
                        id="mediaInput"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleMediaChange}
                      />
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem' }}>
                        <button className="cta-btn secondary" type="button" onClick={handleAddMoreClick}>
                          {mediaFiles.length === 0 ? 'Choose Media' : 'Add More'}
                        </button>
                      </div>
                      {mediaFiles.length > 0 && (
                        <div className="media-preview-list">
                          {mediaFiles.map((file, idx) => (
                            <div key={idx} className="media-preview-item">
                              {file.type.startsWith('image') ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} />
                              ) : (
                                <video src={URL.createObjectURL(file)} controls width="80" />
                              )}
                              <div className="media-filename">{file.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: '2rem' }} />
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={handleNext}
                          disabled={mediaFiles.length === 0}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                  {step === 5 && (
                    <>
                      <h2>Upload Your Bio Image</h2>
                      <label htmlFor="bioImageInput">Select a profile image to represent you</label>
                      <input
                        id="bioImageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={bioImageInputRef}
                        onChange={handleBioImageChange}
                      />
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem' }}>
                        <button className="cta-btn secondary" type="button" onClick={handleBioImageClick}>
                          {bioImage ? 'Change Image' : 'Select Image'}
                        </button>
                      </div>
                      {bioImage && (
                        <div className="bio-image-preview">
                          <img src={URL.createObjectURL(bioImage)} alt="Bio Preview" />
                          <div className="media-filename">{bioImage.name}</div>
                        </div>
                      )}
                      <div style={{ marginTop: '2rem' }} />
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={handleNext}
                          disabled={!bioImage}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                  {step === 6 && (
                    <>
                      <h2>Add Something About You</h2>
                      <label htmlFor="aboutInput">You may add bullets, keywords, or a website link which has your bio.</label>
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '1.2rem 0' }}>
                        <textarea
                          id="aboutInput"
                          value={aboutInput}
                          onChange={e => setAboutInput(e.target.value)}
                          placeholder={"e.g. Painter, digital artist, loves nature, www.mywebsite.com/bio"}
                          rows={4}
                          style={{ width: '60%', minWidth: 260, maxWidth: 500, borderRadius: 8, border: '1px solid #c7d2fe', padding: '0.7rem', fontSize: '1rem' }}
                        />
                      </div>
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={handleGenerateBio}
                          disabled={!aboutInput.trim() || bioLoading}
                        >
                          {bioLoading ? 'Generating...' : 'Generate Bio'}
                        </button>
                      </div>
                      {bioError && (
                        <div className="generated-bio" style={{ color: 'red' }}>{bioError}</div>
                      )}
                      {generatedBio && (
                        <div className="generated-bio">
                          <h3>Your AI-Generated Bio</h3>
                          <p style={{ whiteSpace: 'pre-line' }}>
                            {bioExpanded
                              ? generatedBio
                              : getWordLimitedText(generatedBio, 250)}
                          </p>
                          {generatedBio.split(/\s+/).length > 250 && (
                            <button
                              className="cta-btn secondary"
                              style={{ marginTop: 8 }}
                              onClick={() => setBioExpanded(e => !e)}
                            >
                              {bioExpanded ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                          <div className="modal-actions">
                            <button className="cta-btn primary" onClick={() => setStep(7)}>
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {step === 7 && (
                    <>
                      <h2>Save Your Portfolio</h2>
                      <p>Click below to save your portfolio. You can view or download it at any time.</p>
                      <div className="modal-actions">
                        <button className="cta-btn secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button
                          className="cta-btn primary"
                          onClick={() => {
                            handleSavePortfolio();
                            setShowModal(false);
                            setTimeout(() => {
                              setShowPortfolio(true);
                            }, 200);
                          }}
                        >
                          Save Portfolio
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {/* modal-actions for steps that need it, already handled above */}
              </div>
            </div>
          )}
        </>
      )}
      {showPortfolio && (
        <div className="portfolio-modal">
          <Portfolio
            data={portfolioData}
            onDownload={handleDownloadPortfolio}
            onSave={() => {
              handleDownloadPortfolio();
            }}
            onEdit={() => {
              setShowPortfolio(false);
              setShowModal(true);
            }}
            onDelete={() => {
              localStorage.removeItem('artseePortfolio');
              setPortfolioData(null);
              setShowPortfolio(false);
              alert('Portfolio deleted.');
            }}
          />
        </div>
      )}
    </div>
  )
}

export default App
