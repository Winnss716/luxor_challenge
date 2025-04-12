import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserStatistics from '../Components/UserStatistics';
import OpenBid from '../Components/OpenBid';
import ClosedBid from '../Components/ClosedBid';
import NewBid from '../Components/NewBid';
import CreateCollection from '../Components/CreateCollection';
import UpdateCollection from '../Components/UpdateCollection';
import ManageBid from '../Components/ManageBid';
import { useUser } from '../Services/UserContext';
import './HomePage.css';

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    login_pin?: string;
    role?: 'user' | 'owner';
}

const HomePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState<
        'home' | 'new' | 'open' | 'closed' | 'create_collection' | 'update_collection' | 'manage_bids'
    >('home');
    const navigate = useNavigate();
    const { userId, role, setUserId, setRole } = useUser();

    useEffect(() => {
        console.log('User ID from useUser:', userId);
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        } else {
            navigate('/');
        }
    }, [navigate, userId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('role');
        setUserId(null);
        setRole(null);
        setIsLoggedIn(false);
        setUser(null);
        navigate('/');
    };

    const handleSetView = (
        view: 'home' | 'new' | 'open' | 'closed' | 'create_collection' | 'update_collection' | 'manage_bids'
    ) => {
        console.log('Setting currentView to:', view);
        setCurrentView(view);
    };

    const renderView = () => {
        console.log('Rendering view:', currentView);
        switch (currentView) {
            case 'new':
                return <NewBid />;
            case 'open':
                return <OpenBid />;
            case 'closed':
                return <ClosedBid />;
            case 'create_collection':
                return <CreateCollection />;
            case 'update_collection':
                return <UpdateCollection />;
            case 'manage_bids':
                return <ManageBid />;
            case 'home':
            default:
                return (
                    <>
                        {isLoggedIn && user ? (
                            <div>
                                <div className="logged-in-message">
                                    <p>
                                        Hello, {user.name}! You are logged in as {user.username}.{' '}
                                        <button onClick={handleLogout}>Logout</button>
                                    </p>
                                </div>
                                <UserStatistics />
                            </div>
                        ) : (
                            <div>
                                <h2>Welcome to the Marketplace</h2>
                                <p>Please log in to view your statistics.</p>
                                <Link to="/login" className="home-link">Go to Login</Link>
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div className="home-page">
            <div className="sidebar">
                {isLoggedIn && role === 'user' && (
                    <>
                        <button onClick={() => handleSetView('new')} className="sidebar-button">
                            Create New Bid
                        </button>
                        <button onClick={() => handleSetView('open')} className="sidebar-button">
                            View Current Bids
                        </button>
                        <button onClick={() => handleSetView('closed')} className="sidebar-button">
                            View Closed Bids
                        </button>
                    </>
                )}
                {isLoggedIn && role === 'owner' && (
                    <>
                        <button
                            onClick={() => handleSetView('create_collection')}
                            className="sidebar-button"
                        >
                            Create Collection
                        </button>
                        <button
                            onClick={() => handleSetView('update_collection')}
                            className="sidebar-button"
                        >
                            Update Collection
                        </button>
                        <button
                            onClick={() => handleSetView('manage_bids')}
                            className="sidebar-button"
                        >
                            Manage Bids
                        </button>
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <button onClick={() => handleSetView('home')} className="sidebar-button">
                            Statistics
                        </button>
                        <button onClick={handleLogout} className="sidebar-button logout-button">
                            Logout
                        </button>
                    </>
                )}
            </div>
            <div className="main-content">{renderView()}</div>
        </div>
    );
};

export default HomePage;