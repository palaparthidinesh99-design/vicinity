import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartBar } from '@/features/cart/CartBar';
import './Layout.css';

export function Layout() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="layout">
            <Header />
            <main className={`main-content ${isHomePage ? 'main-content-fluid' : ''}`} style={{ paddingBottom: '3rem' }}>
                {isHomePage ? (
                    <Outlet />
                ) : (
                    <div className="container">
                        <Outlet />
                    </div>
                )}
            </main>
            <CartBar />
            <Footer />
        </div>
    );
}

