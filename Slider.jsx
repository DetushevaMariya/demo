import { useState, useEffect } from 'react';
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.webp';

const images = [img1, img2, img3, img4];

export default function Slider() {
  const [curr, setCurr] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurr((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slider">
      {images.map((src, i) => (
        <img 
          key={i} 
          src={src} 
          className={`slide ${i === curr ? 'active' : ''}`} 
          alt={`Slider image ${i + 1}`} 
        />
      ))}
      <button className="slider-btn prev" onClick={() => setCurr((p) => (p - 1 + images.length) % images.length)}>
        ‹
      </button>
      <button className="slider-btn next" onClick={() => setCurr((p) => (p + 1) % images.length)}>
        ›
      </button>
    </div>
  );
}