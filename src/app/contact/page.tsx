
'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card">
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)', 
            color: 'white', 
            textAlign: 'center', 
            padding: '2rem',
            borderTopLeftRadius: '0.75rem',
            borderTopRightRadius: '0.75rem'
          }}>
            <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Contact Us</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>We'd love to hear from you!</p>
          </div>
          <div className="card-body" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <i className="bi bi-envelope-fill" style={{ fontSize: '2.5rem', color: 'var(--primary-600)', marginBottom: '1rem' }}></i>
                <h4 style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }}>Email Us</h4>
                <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>info@quizwhiz.com</p>
                <a href="mailto:info@quizwhiz.com" className="btn btn-outline-primary">Send Email</a>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <i className="bi bi-phone-fill" style={{ fontSize: '2.5rem', color: 'var(--primary-600)', marginBottom: '1rem' }}></i>
                <h4 style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }}>Call Us</h4>
                <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>+1 (555) 123-4567</p>
                <a href="tel:+15551234567" className="btn btn-outline-primary">Make a Call</a>
              </div>
            </div>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />

            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Send us a Message</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Your Name</label>
                <input type="text" className="form-control" id="name" placeholder="Enter your name" />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Your Email</label>
                <input type="email" className="form-control" id="email" placeholder="Enter your email" />
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" className="form-control" id="subject" placeholder="Subject of your message" />
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea className="form-control" id="message" rows={5} placeholder="Your message" style={{ resize: 'vertical' }}></textarea>
              </div>
              <div style={{ display: 'grid' }}>
                <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
