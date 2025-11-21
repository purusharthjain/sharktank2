
import React, { useState, FormEvent } from 'react';
import { LoadingSpinner } from './Icons';

interface SignupProps {
    onSignupSuccess: (playerId: string) => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const SIGNUP_WEBHOOK_URL = 'https://purusharth.app.n8n.cloud/webhook-test/97713bd5-9510-4685-87a4-89c7244f3dec';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Name is required.');
            return;
        }
        if (!phoneNumber.trim()) {
            setError('Phone number is required.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(SIGNUP_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone_number: phoneNumber }),
            });
            
            const data = await response.json();

            if (!response.ok || data.status !== 'OK') {
                throw new Error(data.message || 'Signup failed. Please try again.');
            }

            if (data.player_id) {
                onSignupSuccess(data.player_id);
            } else {
                throw new Error('Could not retrieve player ID.');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">Join Mock Stock Trader</h1>
                    <p className="mt-2 text-gray-400">Enter your details to get started.</p>
                </header>

                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="e.g., Alice"
                                required
                                disabled={loading}
                                aria-label="Your Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone_number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="e.g., 1234567890"
                                required
                                disabled={loading}
                                aria-label="Phone Number"
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center" role="alert">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner />
                                    <span className="ml-2">Creating Account...</span>
                                </>
                            ) : 'Start Trading'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
