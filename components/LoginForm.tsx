import React, { useState, FormEvent } from 'react';
import { LoadingSpinner } from './Icons';

interface LoginFormProps {
    onLogin: (playerId: number, password: string) => void;
    loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
    const [playerId, setPlayerId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const pId = parseInt(playerId, 10);
        if (isNaN(pId) || pId <= 0) {
            setFormError('Player ID must be a positive number.');
            return;
        }
        if (!password.trim()) {
            setFormError('Password is required.');
            return;
        }

        onLogin(pId, password);
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Back</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                    <label htmlFor="login_player_id" className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                        Player ID
                    </label>
                    <input
                        type="number"
                        id="login_player_id"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        className="w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 text-white placeholder-gray-600 font-medium"
                        placeholder="Enter your ID"
                        min="1"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="group">
                    <label htmlFor="password" className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 text-white placeholder-gray-600 font-medium"
                        placeholder="Enter your Password"
                        required
                        disabled={loading}
                    />
                </div>
                
                {formError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/30">{formError}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner />
                            <span className="ml-2">Authenticating...</span>
                        </>
                    ) : (
                        <span className="tracking-wider">LOGIN TO TERMINAL</span>
                    )}
                </button>
            </form>
        </div>
    );
};
