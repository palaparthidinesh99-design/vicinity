import { Link } from 'react-router-dom';
import { Sparkles, MapPin, ShieldCheck, Zap, Github, Heart } from 'lucide-react';
import './Footer.css';

export function Footer() {
    return (
        <footer className="footer-root">
            <div className="footer-top-gradient" />
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col footer-col-brand">
                        <Link to="/" className="footer-logo">
                            <span className="footer-logo-icon">
                                <Sparkles className="w-4 h-4 text-white" />
                            </span>
                            <span className="footer-logo-text">
                                Vicinity<span className="footer-logo-dot">.</span>
                            </span>
                        </Link>
                        <p className="footer-tagline">
                            The intelligent hyper-local marketplace that bridges buyers and local neighborhood merchants with AI-powered intent search and real-time delivery routing.
                        </p>
                        <div className="footer-status-pill">
                            <span className="footer-status-dot" />
                            <span className="footer-status-text">AI Graph & Delivery Network Online</span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">Marketplace</h4>
                        <ul className="footer-links">
                            <li><Link to="/buyer">Browse Neighborhood</Link></li>
                            <li><Link to="/buyer">Top Rated Sellers</Link></li>
                            <li><Link to="/orders">Order Tracking</Link></li>
                            <li><Link to="/cart">Active Cart</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">For Sellers</h4>
                        <ul className="footer-links">
                            <li><Link to="/signup">Open a Storefront</Link></li>
                            <li><Link to="/seller">Merchant Portal</Link></li>
                            <li><Link to="/seller">Inventory Management</Link></li>
                            <li><Link to="/seller">Local Route Analytics</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Technology</h4>
                        <ul className="footer-links">
                            <li><span className="footer-badge-link">React 19 + TypeScript</span></li>
                            <li><span className="footer-badge-link">Neo4j Graph Search</span></li>
                            <li><span className="footer-badge-link">Gemini AI Intent Engine</span></li>
                            <li><span className="footer-badge-link">Razorpay Multi-Split</span></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-divider" />

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <p className="footer-copyright">
                            © {new Date().getFullYear()} Vicinity Inc. Built with{' '}
                            <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500 mx-0.5" /> for local commerce.
                        </p>
                    </div>

                    <div className="footer-bottom-features">
                        <div className="footer-feature-item">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>15-Min Delivery</span>
                        </div>
                        <div className="footer-feature-item">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Encrypted Checkout</span>
                        </div>
                        <div className="footer-feature-item">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <span>Hyper-Local Matching</span>
                        </div>
                    </div>

                    <div className="footer-bottom-right">
                        <a
                            href="https://github.com/palaparthidinesh99-design/vicinity"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-github-link"
                            title="Vicinity on GitHub"
                        >
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
