
import React, { useState, FormEvent, useEffect } from 'react';
import { TransactionType, TransactionPayload } from '../types';

interface StockFormProps {
    onSubmit: (data: TransactionPayload) => void;
    loading: boolean;
    loggedInPlayerId?: number;
    initialSymbol?: string;
}

export const StockForm: React.FC<StockFormProps> = ({ onSubmit, loading, loggedInPlayerId, initialSymbol }) => {
    const [playerId, setPlayerId] = useState<string>(loggedInPlayerId ? loggedInPlayerId.toString() : '');
    const [symbol, setSymbol] = useState<string>(initialSymbol || 'AAPL');
    const [quantity, setQuantity] = useState<string>('10');
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.BUY);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (loggedInPlayerId) {
            setPlayerId(loggedInPlayerId.toString());
        }
    }, [loggedInPlayerId]);

    useEffect(() => {
        if (initialSymbol) {
            setSymbol(initialSymbol);
        }
    }, [initialSymbol]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const pId = parseInt(playerId, 10);
        if (isNaN(pId) || pId <= 0) {
            setFormError('Player ID must be a positive number.');
            return;
        }

        const qty = parseInt(quantity, 10);
        if (!symbol.trim()) {
            setFormError('Symbol is required.');
            return;
        }
        if (isNaN(qty) || qty <= 0) {
            setFormError('Quantity must be a positive number.');
            return;
        }

        onSubmit({
            player_id: pId,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            transactionType,
        });
    };

    const isSymbolLocked = !!initialSymbol;

    return (
        <div className="w-full animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
                {!loggedInPlayerId && (
                    <div className="group">
                        <label htmlFor="player_id" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                            Player ID
                        </label>
                        <input
                            type="number"
                            id="player_id"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            className="w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 text-white placeholder-gray-600 font-medium"
                            placeholder="e.g., 123"
                            min="1"
                            required
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="symbol" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                            Ticker
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="symbol"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                readOnly={isSymbolLocked}
                                className={`w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none transition-all duration-300 text-white placeholder-gray-600 font-bold uppercase tracking-wider ${
                                    isSymbolLocked 
                                    ? 'opacity-50 cursor-not-allowed focus:border-gray-700' 
                                    : 'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                                }`}
                                placeholder="AAPL"
                                required
                            />
                            {!isSymbolLocked && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-bold pointer-events-none">
                                    NYSE
                                </div>
                            )}
                            {isSymbolLocked && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-bold pointer-events-none">
                                    LOCKED
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="group">
                        <label htmlFor="quantity" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">
                            Units
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-4 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 text-white placeholder-gray-600 font-medium"
                            placeholder="100"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Order Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setTransactionType(TransactionType.BUY)}
                            className={`px-4 py-4 text-sm font-bold rounded-xl transition-all duration-300 border flex items-center justify-center gap-2 ${
                                transactionType === TransactionType.BUY 
                                    ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                                    : 'bg-black/20 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                            }`}
                        >
                             <span className={transactionType === TransactionType.BUY ? 'animate-pulse' : ''}>●</span> BUY
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType(TransactionType.SELL)}
                            className={`px-4 py-4 text-sm font-bold rounded-xl transition-all duration-300 border flex items-center justify-center gap-2 ${
                                transactionType === TransactionType.SELL 
                                    ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                    : 'bg-black/20 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                            }`}
                        >
                             <span className={transactionType === TransactionType.SELL ? 'animate-pulse' : ''}>●</span> SELL
                        </button>
                    </div>
                </div>
                
                {formError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/30 animate-shake">{formError}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                    {loading ? 'Executing Order...' : 'EXECUTE ORDER'}
                </button>
            </form>
        </div>
    );
};
