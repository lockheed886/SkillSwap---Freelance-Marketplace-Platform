// client/src/pages/auth/SignupPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // useNavigate is not used directly here
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'client',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const { name, email, password, confirmPassword, role } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
             setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signup({ name, email, password, role });
            // Navigation handled by AuthContext or AppRoutes
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-8">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your SkillSwap account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                     {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm text-center">{error}</p>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input id="name" name="name" type="text" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Full Name" value={name} onChange={onChange} />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email address" value={email} onChange={onChange} />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input id="password" name="password" type="password" autoComplete="new-password" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password (min. 6 characters)" value={password} onChange={onChange} />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Confirm Password" value={confirmPassword} onChange={onChange} />
                        </div>
                    </div>

                     <div className="mt-6">
                        <span className="text-gray-700 font-medium">Register as:</span>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {['client', 'freelancer', 'admin'].map((roleType) => (
                                <label key={roleType} className="inline-flex items-center p-3 border border-gray-300 rounded-md hover:bg-indigo-50 cursor-pointer transition-colors" style={{ borderColor: 'var(--border-color)', hover: { backgroundColor: 'var(--primary-light)' } }}>
                                    <input
                                        type="radio"
                                        className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        name="role"
                                        value={roleType}
                                        checked={role === roleType}
                                        onChange={onChange}
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    <span className="ml-3 text-gray-800 capitalize">{roleType}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center mt-6">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500" style={{ color: 'var(--primary-color)' }}>
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;