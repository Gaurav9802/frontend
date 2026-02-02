import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import ParticlesBackground from '../components/ParticlesBackground';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="faq-item" onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                {question}
                <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                {answer}
            </div>
        </div>
    );
};

const testimonials = [
    {
        quote: "Hypertool transformed how we handle billing. It's incredibly fast and the design is beautiful.",
        name: "Sarah Jenkins",
        role: "CEO, TechStart",
        avatar: "SJ"
    },
    {
        quote: "The automated follow-ups saved me hours every week. I can't imagine going back to manual invoicing.",
        name: "Rahul Mehta",
        role: "Freelance Designer",
        avatar: "RM"
    },
    {
        quote: "Simple, effective, and reliable. Exactly what a small business needs to grow.",
        name: "Amanda Chen",
        role: "Founder, Studio A",
        avatar: "AC"
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeTestimonial, setActiveTestimonial] = useState(0);


    // Auto-advance testimonials
    React.useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Intersection Observer for scroll animations
    React.useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.reveal-on-scroll');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-container">
            {/* Particles Background */}
            <div className="particles-container">
                <ParticlesBackground />
            </div>
            {/* Header */}
            {/* Header */}
            <LandingNavbar />

            {/* Hero Section */}
            <section className="hero-section reveal-on-scroll">
                <div className="hero-content">
                    <h1>Supercharge Your Workflow</h1>
                    <p>
                        The ultimate all-in-one solution for invoicing, client management,
                        and automated billing. Built for speed, designed for growth.
                    </p>
                    <div className="hero-buttons">
                        <button className="cta-btn primary" onClick={() => navigate('/signup')}>Get Started</button>
                        <button className="cta-btn secondary" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>View Pricing</button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="abstract-shape"></div>
                </div>
            </section>



            {/* Trusted By Section (Infinite Marquee) */}
            <section className="trusted-section reveal-on-scroll">
                <p className="trusted-title">Trusted by innovative teams at</p>
                <div className="brand-marquee">
                    <div className="brand-track">
                        {/* Set 1 */}
                        <div className="brand-item">ACME Corp</div>
                        <div className="brand-item">GlobalTech</div>
                        <div className="brand-item">Nebula</div>
                        <div className="brand-item">Vertex Inc</div>
                        <div className="brand-item">Starlight</div>
                        <div className="brand-item">Quantum</div>
                        <div className="brand-item">Hyperion</div>
                        {/* Set 2 (Duplicate for loop) */}
                        <div className="brand-item">ACME Corp</div>
                        <div className="brand-item">GlobalTech</div>
                        <div className="brand-item">Nebula</div>
                        <div className="brand-item">Vertex Inc</div>
                        <div className="brand-item">Starlight</div>
                        <div className="brand-item">Quantum</div>
                        <div className="brand-item">Hyperion</div>
                    </div>
                </div>
            </section>

            {/* Curve Divider 2 */}
            <div className="curve-divider rotated">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill"></path>
                </svg>
            </div>

            {/* Features Section */}
            <section id="features" className="features-section reveal-on-scroll" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Orbs */}
                <div className="bg-orb" style={{ top: '10%', left: '-5%', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)' }}></div>
                <div className="bg-orb" style={{ bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(50, 50, 100, 0.05)', animationDelay: '2s' }}></div>

                <h2 style={{ position: 'relative', zIndex: 1 }}>Features designed for speed</h2>
                <div className="features-grid" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="feature-card">
                        <span className="icon">⚡️</span>
                        <h3>Lightning Fast Invoicing</h3>
                        <p>Create and send professional GST invoices in seconds. Automated calculations ensure zero errors.</p>
                    </div>
                    <div className="feature-card">
                        <span className="icon">👥</span>
                        <h3>Smart Client Management</h3>
                        <p>Keep track of all your clients in one place with detailed history and automated follow-ups.</p>
                    </div>
                    <div className="feature-card">
                        <span className="icon">🔒</span>
                        <h3>Secure & Reliable</h3>
                        <p>Your data is encrypted and backed up automatically. Focus on your business, we handle the security.</p>
                    </div>
                </div>
            </section>

            {/* Tilt Divider */}
            <div className="tilt-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="shape-fill"></path>
                </svg>
            </div>

            {/* How It Works Section */}
            <div className="how-it-works-section reveal-on-scroll" style={{ position: 'relative' }}>
                <h2>How it works</h2>
                <div className="steps-container">
                    <div className="step-line"></div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-circle">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up in seconds. No credit card required for the free tier.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-circle">2</div>
                            <h3>Add Clients</h3>
                            <p>Import your client list or add them one-by-one with our smart forms.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-circle">3</div>
                            <h3>Get Paid</h3>
                            <p>Send professional invoices and track payments in real-time.</p>
                        </div>
                    </div>
                </div>
            </div>



            {/* Pricing Section */}
            <section id="pricing" className="pricing-section reveal-on-scroll">
                <h2>Simple, transparent pricing</h2>
                <div className="pricing-grid">

                    {/* Card 1: Starter */}
                    <div className="pricing-card">
                        <div className="card-header">
                            <h3>Starter</h3>
                            <p className="price">₹0<span>/mo</span></p>
                        </div>
                        <ul className="features-list">
                            <li>✅ Up to 5 Clients</li>
                            <li>✅ Basic Invoicing</li>
                            <li>✅ Email Support</li>
                            <li>❌ GST Reports</li>
                        </ul>
                        <button className="choose-btn" onClick={() => navigate('/signup')}>Start Free</button>
                    </div>

                    {/* Card 2: Pro (Highlighted) */}
                    <div className="pricing-card popular">
                        <div className="badge">MOST POPULAR</div>
                        <div className="card-header">
                            <h3>Professional</h3>
                            <p className="price">₹999<span>/mo</span></p>
                        </div>
                        <ul className="features-list">
                            <li>✅ Unlimited Clients</li>
                            <li>✅ Advanced Invoicing</li>
                            <li>✅ Priority Email Support</li>
                            <li>✅ GST & Tax Reports</li>
                            <li>✅ Automated Follow-ups</li>
                        </ul>
                        <button className="choose-btn primary" onClick={() => navigate('/signup')}>Get Started</button>
                    </div>

                    {/* Card 3: Enterprise */}
                    <div className="pricing-card">
                        <div className="card-header">
                            <h3>Enterprise</h3>
                            <p className="price">Custom</p>
                        </div>
                        <ul className="features-list">
                            <li>✅ Everything in Pro</li>
                            <li>✅ Dedicated Account Manager</li>
                            <li>✅ Custom API Access</li>
                            <li>✅ White-labeling</li>
                        </ul>
                        <button className="choose-btn" onClick={() => navigate('/login')}>Contact Sales</button>
                    </div>

                </div>
            </section>

            {/* Testimonials Section (Spotlight) */}
            <div className="testimonials-section spotlight reveal-on-scroll">
                <div className="bg-orb spotlight-orb"></div>
                <h2>Loved by global teams</h2>
                <div className="spotlight-container">
                    {testimonials.map((t, index) => (
                        <div
                            key={index}
                            className={`spotlight-card ${index === activeTestimonial ? 'active' : ''}`}
                        >
                            <div className="quote-icon">“</div>
                            <p className="quote">{t.quote}</p>
                            <div className="user-info">
                                <div className="user-avatar">{t.avatar}</div>
                                <div>
                                    <span className="user-name">{t.name}</span>
                                    <span className="user-role">{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="spotlight-dots">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                            onClick={() => setActiveTestimonial(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Triangle Divider */}
            <div className="triangle-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M1200 0L0 0 598.97 114.72 1200 0z" className="shape-fill"></path>
                </svg>
            </div>

            {/* FAQ Section */}
            <div className="faq-section reveal-on-scroll">
                <div className="faq-container">
                    <h2>Frequently asked questions</h2>
                    <div className="faq-grid">
                        <FaqItem
                            question="Is there a free trial?"
                            answer="Yes, our Starter plan is completely free forever for up to 5 clients. You can upgrade anytime."
                        />
                        <FaqItem
                            question="Can I export my data?"
                            answer="Absolutely. You can export all your invoices and client data to CSV or PDF at any time."
                        />
                        <FaqItem
                            question="Is my data secure?"
                            answer="We use bank-grade encryption and daily backups to ensure your data is always safe and accessible only to you."
                        />
                        <FaqItem
                            question="Do you support GST billing?"
                            answer="Yes, Hypertool is fully compliant with GST regulations and generates GST-ready invoices automatically."
                        />
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="final-cta-section reveal-on-scroll">
                <div className="final-cta-container">
                    <div className="final-cta-content">
                        <h2>Ready to streamline your business?</h2>
                        <p>Join thousands of businesses managing their invoices with Hypertool.</p>
                        <button className="cta-btn primary white" onClick={() => navigate('/signup')}>Get Started for Free</button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {/* Footer */}
            <LandingFooter />
        </div>
    );
};

export default LandingPage;
