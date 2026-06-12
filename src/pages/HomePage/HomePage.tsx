import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ENV } from '@/shared/config/env';
import { DEMO_POIS } from '@/widgets/MapWithPOIs/demoPOIs';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const quickActions = [
    { id: 'map',      label: 'Mapa',        icon: '🗺️', color: '#1769C9', path: '/map' },
    { id: 'routes',   label: 'Rutas',       icon: '🧭', color: '#BA7517', path: '/routes' },
    { id: 'gallery',  label: 'Galería',     icon: '📷', color: '#993C1D', path: '/gallery' },
    { id: 'ar',       label: 'RA',          icon: '🎨', color: '#534AB7', path: '/ar' },
    { id: 'audio',    label: 'Audioguías',  icon: '🎧', color: '#3B6D11', path: '/audio' },
    { id: 'passport', label: 'Pasaporte',   icon: '🏅', color: '#0F6E56', path: '/passport' },
  ];

  // Tres POI destacados para mostrar como descubrimientos
  const highlights = DEMO_POIS.slice(0, 3);

  return (
    <div className="home-page">
      {/* HERO */}
      <header className="hero">
        <div className="hero-content">
          <p className="hero-greeting">{greeting}</p>
          <h1 className="hero-title">Descubre<br/>{ENV.APP_CITY}</h1>
          <p className="hero-subtitle">{ENV.APP_NAME}</p>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{DEMO_POIS.length}</span>
            <span className="stat-label">Lugares</span>
          </div>
          <div className="stat">
            <span className="stat-num">2h</span>
            <span className="stat-label">Recorrido</span>
          </div>
          <div className="stat">
            <span className="stat-num">∞</span>
            <span className="stat-label">Historias</span>
          </div>
        </div>
      </header>

      {/* CTA principal */}
      <button className="hero-cta" onClick={() => navigate('/map')}>
        <span className="cta-icon">▶</span>
        <span>Comenzar recorrido</span>
      </button>

      {/* GRID de accesos */}
      <section className="section">
        <h2 className="section-title">Explora</h2>
        <div className="grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="grid-item"
              onClick={() => navigate(action.path)}
            >
              <div className="grid-icon" style={{ background: action.color + '1A', color: action.color }}>
                <span>{action.icon}</span>
              </div>
              <span className="grid-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TARJETAS DE DESCUBRIMIENTO */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Lugares destacados</h2>
          <button className="section-link" onClick={() => navigate('/map')}>
            Ver todos →
          </button>
        </div>
        <div className="cards-scroll">
          {highlights.map((poi) => (
            <article
              key={poi.id}
              className="card"
              onClick={() => navigate('/map')}
            >
              <div
                className="card-image"
                style={{
                  backgroundImage: poi.imageUrl ? `url(${poi.imageUrl})` : 'none',
                }}
              >
                <span className="card-badge">{poi.category}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{poi.name}</h3>
                <p className="card-desc">{poi.description.slice(0, 70)}…</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA SECUNDARIO: Pasaporte */}
      <section className="section">
        <div className="banner" onClick={() => navigate('/passport')}>
          <div className="banner-content">
            <p className="banner-eyebrow">Reto del día</p>
            <h3 className="banner-title">Visita 3 lugares hoy y gana tu primer sello</h3>
            <p className="banner-cta">Ver pasaporte →</p>
          </div>
          <div className="banner-icon">🏆</div>
        </div>
      </section>

      <footer className="home-footer">
        <button className="footer-btn" onClick={() => navigate('/settings')}>
          Ajustes
        </button>
        <span className="footer-dot">·</span>
        <button className="footer-btn" onClick={() => navigate('/about')}>
          Acerca de
        </button>
      </footer>
    </div>
  );
}