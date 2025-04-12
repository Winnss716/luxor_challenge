import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { createUser, loginUser, forgotPassword } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Login.css';

interface LoginForm {
    username: string;
    password: string;
}

interface CreateAccountForm {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    login_pin?: string;
    confirmLoginPin?: string;
}

interface ForgotPasswordForm {
    email: string;
}

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'create' | 'forgot'>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const { setUserId, setRole } = useUser();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');
        if (token && userId && role) {
            setIsLoggedIn(true);
            setUserId(userId);
            setRole(role as 'user' | 'owner');
            navigate('/home');
        }
    }, [navigate, setUserId, setRole]);

    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm<LoginForm>();

    const {
        register: registerCreate,
        handleSubmit: handleCreateSubmit,
        watch: watchCreate,
        formState: { errors: createErrors },
        reset: resetCreate,
    } = useForm<CreateAccountForm>({
        defaultValues: {
            name: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            login_pin: '',
            confirmLoginPin: '',
        },
    });

    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        formState: { errors: forgotErrors },
        reset: resetForgot,
    } = useForm<ForgotPasswordForm>();

    const onLogin: SubmitHandler<LoginForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const { token, user } = await loginUser(data);
            if (!user.id || !user.role) {
                throw new Error('User ID or role not provided by server');
            }
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('role', user.role);
            setUserId(user.id);
            setRole(user.role);
            setIsLoggedIn(true);
            navigate('/home');
        } catch (err) {
            setError((err as Error).message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const onCreate: SubmitHandler<CreateAccountForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const userData = {
                name: data.name,
                email: data.email,
                username: data.username,
                password: data.password,
                login_pin: data.login_pin,
            };
            await createUser(userData);
            resetCreate();
            setMode('login');
            alert('Account created successfully! Please log in.');
        } catch (err) {
            setError((err as Error).message || 'Failed to create account.');
        } finally {
            setIsLoading(false);
        }
    };

    const onForgot: SubmitHandler<ForgotPasswordForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await forgotPassword(data);
            resetForgot();
            alert('Password reset link sent to your email.');
            setMode('login');
        } catch (err) {
            setError((err as Error).message || 'Failed to send reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('role');
        setUserId(null);
        setRole(null);
        setIsLoggedIn(false);
        setError(null);
    };

    const password = watchCreate('password');
    const loginPin = watchCreate('login_pin');

    return (
        <div className="login-page">
            <div className="form-container">
                <h2>
                    {mode === 'login' ? 'Login' : mode === 'create' ? 'Create Account' : 'Forgot Password'}
                </h2>
                {error && <p className="error">{error}</p>}
                {isLoggedIn && (
                    <div className="logged-in-message">
                        <p>
                            You are logged in. <button onClick={handleLogout}>Logout</button>
                        </p>
                        <Link to="/" className="home-link">Go to Homepage</Link>
                    </div>
                )}

                {/* Login Form */}
                {mode === 'login' && !isLoggedIn && (
                    <form onSubmit={handleLoginSubmit(onLogin)}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                disabled={isLoading}
                                {...registerLogin('username', { required: 'Username is required' })}
                            />
                            {loginErrors.username && <span className="error">{loginErrors.username.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                {...registerLogin('password', { required: 'Password is required' })}
                            />
                            {loginErrors.password && <span className="error">{loginErrors.password.message}</span>}
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="form-links">
                            <button type="button" onClick={() => setMode('create')} disabled={isLoading}>
                                Create Account
                            </button>
                            <button type="button" onClick={() => setMode('forgot')} disabled={isLoading}>
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                )}

                {/* Create Account Form */}
                {mode === 'create' && !isLoggedIn && (
                    <form onSubmit={handleCreateSubmit(onCreate)}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                disabled={isLoading}
                                {...registerCreate('name', { required: 'Name is required' })}
                            />
                            {createErrors.name && <span className="error">{createErrors.name.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                disabled={isLoading}
                                {...registerCreate('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                                })}
                            />
                            {createErrors.email && <span className="error">{createErrors.email.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="create-username">Username</label>
                            <input
                                id="create-username"
                                type="text"
                                disabled={isLoading}
                                {...registerCreate('username', { required: 'Username is required' })}
                            />
                            {createErrors.username && <span className="error">{createErrors.username.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="create-password">Password</label>
                            <input
                                id="create-password"
                                type="password"
                                disabled={isLoading}
                                {...registerCreate('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                })}
                            />
                            {createErrors.password && <span className="error">{createErrors.password.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                disabled={isLoading}
                                {...registerCreate('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                            />
                            {createErrors.confirmPassword && (
                                <span className="error">{createErrors.confirmPassword.message}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="login_pin">Login PIN (Optional)</label>
                            <input
                                id="login_pin"
                                type="text"
                                disabled={isLoading}
                                {...registerCreate('login_pin')}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-login-pin">Confirm Login PIN (Required if PIN is set)</label>
                            <input
                                id="confirm-login-pin"
                                type="text"
                                disabled={isLoading}
                                {...registerCreate('confirmLoginPin', {
                                    validate: (value) =>
                                        !loginPin || value === loginPin || 'Login PINs do not match',
                                })}
                            />
                            {createErrors.confirmLoginPin && (
                                <span className="error">{createErrors.confirmLoginPin.message}</span>
                            )}
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Account'}
                        </button>
                        <div className="form-links">
                            <button type="button" onClick={() => setMode('login')} disabled={isLoading}>
                                Back to Login
                            </button>
                        </div>
                        <Link to="/" className="home-link">Back to Home</Link>
                    </form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && !isLoggedIn && (
                    <form onSubmit={handleForgotSubmit(onForgot)}>
                        <div className="form-group">
                            <label htmlFor="forgot-email">Email</label>
                            <input
                                id="forgot-email"
                                type="email"
                                disabled={isLoading}
                                {...registerForgot('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                                })}
                            />
                            {forgotErrors.email && <span className="error">{forgotErrors.email.message}</span>}
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </button>
                        <div className="form-links">
                            <button type="button" onClick={() => setMode('login')} disabled={isLoading}>
                                Back to Login
                            </button>
                        </div>
                        <Link to="/" className="home-link">Back to Home</Link>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;