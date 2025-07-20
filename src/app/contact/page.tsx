
'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0">Contact Us</h2>
              <p className="mb-0">We'd love to hear from you!</p>
            </div>
            <div className="card-body p-5">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="contact-info-box text-center p-4 rounded shadow-sm h-100">
                    <i className="bi bi-envelope-fill text-primary fs-1 mb-3"></i>
                    <h4 className="text-primary">Email Us</h4>
                    <p className="lead">info@quizwhiz.com</p>
                    <a href="mailto:info@quizwhiz.com" className="btn btn-outline-primary mt-3">Send Email</a>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="contact-info-box text-center p-4 rounded shadow-sm h-100">
                    <i className="bi bi-phone-fill text-primary fs-1 mb-3"></i>
                    <h4 className="text-primary">Call Us</h4>
                    <p className="lead">+1 (555) 123-4567</p>
                    <a href="tel:+15551234567" className="btn btn-outline-primary mt-3">Make a Call</a>
                  </div>
                </div>
              </div>

              <hr className="my-5" />

              <h3 className="text-center mb-4">Send us a Message</h3>
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
                  <textarea className="form-control" id="message" rows={5} placeholder="Your message"></textarea>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
