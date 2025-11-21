
import React from 'react';
import { TransactionType, TransactionPayload } from '../types';
import { LoadingSpinner } from './Icons';

interface StocksViewProps {
    onSubmit: (data: TransactionPayload) => void;
    loading: boolean;
    loggedInPlayerId?: number;
}

export const StocksView: React.FC<StocksViewProps> = ({ onSubmit, loading, loggedInPlayerId }) => {
    const handleGetStocks = () => {
        if (loggedInPlayerId) {
            onSubmit({
                player_id: loggedInPlayerId,
                transactionType: TransactionType.GET_STOCKS
            });
        }
    };

    return (
        <div className="w-full animate-fade-in">
            <button
                onClick={handleGetStocks}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg group border border-white/10"
            >
                {loading ? (
                    <>
                         <LoadingSpinner />
                         <span className="ml-2">Fetching Data...</span>
                    </>
                ) : (
                    <span className="tracking-widest uppercase text-sm">Get Live Stock Data</span>
                )}
            </button>
        </div>
    );
};
