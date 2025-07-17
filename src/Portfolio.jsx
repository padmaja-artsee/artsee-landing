import React from 'react';

function Portfolio({ data, onDownload, onSave, onEdit, onDelete }) {
  if (!data) return <div>No portfolio data available.</div>;
  const { userName, tagline, bioImage, genres, socials, mediaFiles, generatedBio } = data;

  // Separate images and videos for grid
  const images = (mediaFiles || []).filter(file => file.type && file.type.startsWith('image'));
  const videos = (mediaFiles || []).filter(file => file.type && file.type.startsWith('video'));

  return (
    <div className="portfolio-page">
      {/* Artist Name Centered */}
      <div className="portfolio-artist-name">
        <h1>{userName}</h1>
        {tagline && <h2 className="portfolio-tagline">{tagline}</h2>}
      </div>
      {/* Bio Pic and Bio Side by Side */}
      <div className="portfolio-bio-row">
        {bioImage && (
          <img src={bioImage} alt="Bio" className="portfolio-bio-image-large" />
        )}
        <div className="portfolio-bio-box">
          <h3>Bio</h3>
          <div>{generatedBio}</div>
          <div className="portfolio-section">
            <h4>Genres</h4>
            <div>{genres && genres.join(', ')}</div>
          </div>
          <div className="portfolio-section">
            <h4>Social Media</h4>
            <ul>
              {socials?.instagram && <li>Instagram: {socials.instagram}</li>}
              {socials?.twitter && <li>Twitter: {socials.twitter}</li>}
              {socials?.other && <li>Other: {socials.other}</li>}
            </ul>
          </div>
        </div>
      </div>
      {/* Instagram-style Media Grid */}
      <div className="portfolio-media-grid">
        {[...images, ...videos].slice(0, 20).map((file, idx) => (
          <div key={idx} className="portfolio-media-grid-item">
            {file.type && file.type.startsWith('image') && typeof file.base64 === 'string' ? (
              <img src={file.base64} alt={file.name} />
            ) : file.type && file.type.startsWith('video') && typeof file.base64 === 'string' ? (
              <video src={file.base64} controls playsInline />
            ) : null}
          </div>
        ))}
      </div>
      <div className="portfolio-actions">
        <button className="cta-btn primary" onClick={onSave}>Save (Download)</button>
        <button className="cta-btn secondary" onClick={onEdit}>Edit</button>
        <button className="cta-btn secondary" onClick={onDelete}>Delete</button>
        <button className="cta-btn secondary" onClick={onDownload}>Download Portfolio</button>
      </div>
    </div>
  );
}

export default Portfolio; 