import React from 'react';
import { ApiResponse } from '../types';
import { LoadingSpinner, SuccessIcon, ErrorIcon } from './Icons';

interface TransactionResultProps {
    loading: boolean;
    error: string | null;
    result: ApiResponse | null;
    onSymbolClick?: (symbol: string) => void;
    simpleView?: boolean;
}

interface AccountInfo {
    player_id: number;
    name: string;
    cash_balance: number;
    holdings: string; // JSON string like "{\"AAPL\":20}"
}

export const TransactionResult: React.FC<TransactionResultProps> = ({ loading, error, result, onSymbolClick, simpleView }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-cyan-400 py-8 animate-pulse">
                <LoadingSpinner />
                <p className="mt-3 text-xs font-bold tracking-widest uppercase opacity-80">Processing Request</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start space-x-4 animate-fade-in backdrop-blur-sm">
                <div className="p-2 bg-red-500/20 rounded-full">
                    <ErrorIcon />
                </div>
                <div>
                    <p className="font-bold text-sm uppercase tracking-wider text-red-400">Request Failed</p>
                    <p className="text-sm mt-1 opacity-90">{error}</p>
                </div>
            </div>
        );
    }

    if (result && result.success) {
        const dataArray = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
        
        // Only attempt to render complex views if simpleView is NOT enabled
        if (!simpleView) {
            // 1. Check if this is Account View
            const accountData = dataArray.length > 0 ? dataArray[0] : null;
            const isAccountView = accountData && typeof accountData === 'object' && 'cash_balance' in accountData && 'holdings' in accountData;

            if (isAccountView) {
                const account = accountData as AccountInfo;
                let holdingsMap: Record<string, number> = {};
                
                try {
                    // The holdings field is a stringified JSON object
                    holdingsMap = typeof account.holdings === 'string' ? JSON.parse(account.holdings) : account.holdings;
                } catch (e) {
                    console.error("Failed to parse holdings", e);
                }

                const hasHoldings = Object.keys(holdingsMap).length > 0;

                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 overflow-hidden shadow-xl">
                            
                            {/* Header */}
                            <div className="bg-black/20 p-4 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Portfolio Owner</p>
                                    <p className="text-lg font-bold text-white">{account.name}</p>
                                </div>
                                <div className="bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700">
                                    <span className="text-xs font-mono text-cyan-400">#{account.player_id}</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                 {/* Cash Card */}
                                <div className="mb-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/10 p-5 rounded-xl border border-emerald-500/20 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Cash Balance</p>
                                    <p className="text-4xl font-mono font-bold text-white relative z-10 drop-shadow-sm">${account.cash_balance.toLocaleString()}</p>
                                </div>

                                {/* Holdings */}
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 pl-1">Asset Allocation</p>
                                    {hasHoldings ? (
                                        <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                                                    <tr>
                                                        <th className="px-5 py-3 font-bold tracking-wider">Symbol</th>
                                                        <th className="px-5 py-3 text-right font-bold tracking-wider">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {Object.entries(holdingsMap).map(([symbol, quantity]) => (
                                                        <tr key={symbol} className="hover:bg-white/5 transition-colors group">
                                                            <td className="px-5 py-3 font-bold text-cyan-400 group-hover:text-cyan-300">{symbol}</td>
                                                            <td className="px-5 py-3 text-right text-gray-200 font-mono">{quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-black/20 rounded-xl border border-gray-800 border-dashed">
                                            <p className="text-sm">No active positions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // 2. Check if this is a Generic List View (e.g. Stock Data)
            // If data is an array of objects, try to render a table
            if (dataArray.length > 0 && typeof dataArray[0] === 'object') {
                 const headers = Object.keys(dataArray[0]);
                 
                 return (
                    <div className="space-y-4 animate-fade-in-up">
                         <div className="rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 overflow-hidden shadow-xl">
                            <div className="bg-black/20 p-4 border-b border-white/5">
                                 <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Live Market Data</p>
                            </div>
                            <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                                        <tr>
                                            {headers.map(h => (
                                                <th key={h} className="px-5 py-3 font-bold tracking-wider">{h.replace(/_/g, ' ')}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {dataArray.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                 {headers.map(h => {
                                                     const isSymbol = h.toLowerCase() === 'symbol' || h.toLowerCase() === 'ticker' || h.toLowerCase() === 'name';
                                                     return (
                                                        <td 
                                                            key={`${idx}-${h}`} 
                                                            className={`px-5 py-3 font-medium text-gray-200 ${isSymbol && onSymbolClick ? 'cursor-pointer text-cyan-400 hover:text-cyan-300 hover:underline' : ''}`}
                                                            onClick={() => isSymbol && onSymbolClick && onSymbolClick(String(row[h]))}
                                                            title={isSymbol ? "Click to Trade" : undefined}
                                                        >
                                                            {typeof row[h] === 'object' ? JSON.stringify(row[h]) : row[h]}
                                                        </td>
                                                     );
                                                 })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    </div>
                 );
            }
        }

        // 3. Fallback / Generic Transaction Result
        return (
            <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-100 flex items-start space-x-4 backdrop-blur-sm shadow-lg shadow-green-900/10">
                    <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                        <SuccessIcon />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm uppercase tracking-wider text-green-400">Confirmed</p>
                        <p className="text-sm mt-1 font-medium opacity-90">{result.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};