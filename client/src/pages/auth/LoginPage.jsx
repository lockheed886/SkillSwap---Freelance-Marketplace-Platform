// client/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // useNavigate is not used directly here anymore
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isLoading: authLoading } = useAuth();

    const { email, password } = formData;

    const onChange = (e) => {
         setFormData({ ...formData, [e.target.name]: e.target.value });
         setError('');
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            // Navigation handled by AuthContext or AppRoutes redirection
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
        } finally {
             setLoading(false);
        }
    };

    const isSubmitting = loading || authLoading;

    return (
        // The Layout component provides the overall page structure and padding.
        // This div centers the login form card within the main content area.
        <div className="flex items-center justify-center py-8">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to SkillSwap
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm text-center">{error}</p>}
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address" name="email" type="email" autoComplete="email" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address" value={email} onChange={onChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password" name="password" type="password" autoComplete="current-password" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password" value={password} onChange={onChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                 <div className="text-sm text-center mt-6">
                    <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500" style={{ color: 'var(--primary-color)' }}>
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;