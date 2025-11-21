import React, { useState, FormEvent, useEffect } from 'react';
import { TransactionType, TransactionPayload } from '../types';

interface AccountFormProps {
    onSubmit: (data: TransactionPayload) => void;
    loading: boolean;
    loggedInPlayerId?: number;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, loading, loggedInPlayerId }) => {
    const [playerId, setPlayerId] = useState<string>(loggedInPlayerId ? loggedInPlayerId.toString() : '');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (loggedInPlayerId) {
            setPlayerId(loggedInPlayerId.toString());
        }
    }, [loggedInPlayerId]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const pId = parseInt(playerId, 10);
        if (isNaN(pId) || pId <= 0) {
            setFormError('Player ID must be a positive number.');
            return;
        }

        onSubmit({
            player_id: pId,
            transactionType: TransactionType.DISPLAY_ACCOUNT,
        });
    };

    return (
        <div className="w-full animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
                {!loggedInPlayerId && (
                    <div className="group">
                        <label htmlFor="account_player_id" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                            Player ID
                        </label>
                        <input
                            type="number"
                            id="account_player_id"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            className="w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 text-white placeholder-gray-600 font-medium"
                            placeholder="Enter Player ID"
                            min="1"
                            required
                        />
                    </div>
                )}
                
                {formError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/30">{formError}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                    {loading ? 'Retrieving Data...' : 'FETCH PORTFOLIO'}
                </button>
            </form>
        </div>
    );
};
