
import React, { useState } from 'react';
import { StockForm } from './components/StockForm';
import { AccountForm } from './components/AccountForm';
import { LoginForm } from './components/LoginForm';
import { StocksView } from './components/StocksView';
import { TransactionResult } from './components/TransactionResult';
import { TransactionPayload, ApiResponse, TransactionType } from './types';

type Tab = 'account' | 'stocks';

const App: React.FC = () => {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loggedInPlayerId, setLoggedInPlayerId] = useState<number | null>(null);
    const [loggedInPassword, setLoggedInPassword] = useState<string | null>(null);

    // App State
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ApiResponse | null>(null);

    // Modal State
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    
    // Modal Specific Transaction State (to keep background data intact)
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalResult, setModalResult] = useState<ApiResponse | null>(null);

    const handleLogin = async (playerId: number, password: string) => {
        setLoading(true);
        setError(null);
        
        // Production URL for login
        const loginUrl = 'https://purusharth.app.n8n.cloud/webhook/stock-transaction';

        try {
            const payload: TransactionPayload = {
                player_id: playerId,
                password: password,
                transactionType: TransactionType.LOGIN
            };

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const rawData = await response.json();
            
            // Normalize data: if array, get first item. This handles [{"success": "true"}]
            const responseData = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || `Login failed with status ${response.status}`);
            }

            // Check for explicit success based on user requirements: success="true"
            const isSuccess = responseData.success === true || responseData.success === 'true';

            if (!isSuccess) {
                throw new Error(responseData.message || "Login failed. Please check credentials.");
            }

            // Success: Store credentials and log in immediately
            setLoggedInPlayerId(playerId);
            setLoggedInPassword(password);
            setResult(null); // Clear any previous results
            setIsLoggedIn(true);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: TransactionPayload) => {
        setLoading(true);
        setError(null);
        setResult(null);

        // Use the production webhook URL for all actions
        const webhookUrl = 'https://purusharth.app.n8n.cloud/webhook/stock-transaction';

        try {
            // Inject the stored password into the payload if logged in
            const finalPayload = {
                ...formData,
                ...(isLoggedIn && loggedInPassword ? { password: loggedInPassword } : {})
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalPayload),
            });
            
            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.error || responseData.message || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            // Check for logical failure in response body (handling explicit failure cases)
            if (responseData && (responseData.success === false || responseData.success === 'false')) {
                 throw new Error(responseData.message || "Operation failed. Please check the input and try again.");
            }

            let successMessage = "Transaction processed successfully!";
            if (activeTab === 'account') successMessage = "Account details retrieved.";
            if (activeTab === 'stocks') successMessage = "Stock data retrieved.";

            setResult({
                success: true,
                message: responseData.message || successMessage,
                data: responseData
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (formData: TransactionPayload) => {
        setModalLoading(true);
        setModalError(null);
        setModalResult(null);

        const webhookUrl = 'https://purusharth.app.n8n.cloud/webhook/stock-transaction';

        try {
            const finalPayload = {
                ...formData,
                ...(isLoggedIn && loggedInPassword ? { password: loggedInPassword } : {})
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });
            
            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.error || responseData.message || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            if (responseData && (responseData.success === false || responseData.success === 'false')) {
                 throw new Error(responseData.message || "Operation failed.");
            }

            setModalResult({
                success: true,
                message: responseData.message || "Transaction processed successfully!",
                data: responseData
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setModalError(errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setTradeModalOpen(false);
        setModalResult(null);
        setModalError(null);
        setModalLoading(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setLoggedInPlayerId(null);
        setLoggedInPassword(null);
        setResult(null);
        setError(null);
        setActiveTab('account');
    };

    const handleStockClick = (symbol: string) => {
        setSelectedSymbol(symbol);
        setTradeModalOpen(true);
        // Reset modal state when opening fresh
        setModalResult(null);
        setModalError(null);
    };

    // Tab helper to simplify the render
    const getTabClass = (tabName: Tab) => {
        const isActive = activeTab === tabName;
        return `flex-1 py-3 px-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative z-10 ${
            isActive
                ? 'text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'text-gray-500 hover:text-gray-300'
        }`;
    };

    const getTabBackgroundPosition = () => {
        if (activeTab === 'account') return 'left-1.5';
        return 'left-[calc(50%+3px)]'; // stocks
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0f] to-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
            <div className="w-full max-w-lg space-y-8 relative z-10">
                
                {/* Header Section */}
                <header className="text-center mb-10 transform transition-all duration-700 hover:scale-105">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse-slow">
                        SHARK TANK
                    </h1>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2 mb-2 rounded-full opacity-80"></div>
                    <p className="text-xl font-bold text-cyan-400 mt-1 drop-shadow-md">Manipal</p>
                </header>
                
                {/* Main Card Container */}
                <div className="relative group">
                    {/* Glow Effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div className={`relative bg-gray-900/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden min-h-[400px] flex flex-col ${!isLoggedIn ? 'justify-center' : 'justify-start'}`}>
                        
                        {/* Conditional Rendering based on Login State */}
                        {!isLoggedIn ? (
                            <div className="flex-1 flex flex-col justify-center">
                                <LoginForm onLogin={handleLogin} loading={loading} />
                                {error && (
                                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center backdrop-blur-sm animate-fade-in">
                                        {error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fade-in-up w-full">
                                <div className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-xl mb-6 backdrop-blur-md">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                                            ID
                                        </div>
                                        <span className="text-sm text-gray-300">Player <span className="text-cyan-300 font-bold text-lg ml-1">{loggedInPlayerId}</span></span>
                                    </div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-xs font-semibold text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                                    >
                                        Logout
                                    </button>
                                </div>

                                <div className="flex bg-black/40 p-1.5 rounded-xl mb-8 border border-white/5 relative">
                                    <button
                                        onClick={() => { setActiveTab('account'); setResult(null); setError(null); }}
                                        className={getTabClass('account')}
                                    >
                                        ACCOUNT
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('stocks'); setResult(null); setError(null); }}
                                        className={getTabClass('stocks')}
                                    >
                                        STOCKS
                                    </button>
                                    
                                    {/* Sliding Background for Tabs */}
                                    <div 
                                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-300 ease-out shadow-lg ${getTabBackgroundPosition()}`}
                                    ></div>
                                </div>

                                <div className="transition-all duration-500 ease-in-out min-h-[80px]">
                                    {activeTab === 'account' && (
                                        <AccountForm 
                                            onSubmit={handleSubmit} 
                                            loading={loading} 
                                            loggedInPlayerId={loggedInPlayerId || undefined}
                                        />
                                    )}
                                    {activeTab === 'stocks' && (
                                        <StocksView
                                            onSubmit={handleSubmit} 
                                            loading={loading} 
                                            loggedInPlayerId={loggedInPlayerId || undefined}
                                        />
                                    )}
                                </div>
                                
                                <div className="mt-4">
                                    <TransactionResult 
                                        loading={loading} 
                                        error={error} 
                                        result={result} 
                                        onSymbolClick={handleStockClick} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trade Modal */}
            {tradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl ring-1 ring-cyan-500/30 animate-fade-in-up max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-20 blur-md pointer-events-none"></div>
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-white/5 rounded-full p-1 hover:bg-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">QUICK TRADE</span>
                                <span className="text-gray-500 text-lg font-mono">// {selectedSymbol}</span>
                            </h3>
                            <StockForm 
                                onSubmit={handleModalSubmit}
                                loading={modalLoading} 
                                loggedInPlayerId={loggedInPlayerId || undefined}
                                initialSymbol={selectedSymbol}
                            />
                            {/* Result displayed INSIDE the modal */}
                            <div className="mt-6">
                                <TransactionResult 
                                    loading={modalLoading} 
                                    error={modalError} 
                                    result={modalResult}
                                    simpleView={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-16 text-center relative z-10 flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity duration-500">
                <p className="text-gray-300 text-xs font-bold tracking-[0.15em] uppercase bg-gradient-to-r from-gray-500 via-white to-gray-500 bg-clip-text text-transparent">
                    Finance Committee, KMC Manipal
                </p>
                <p className="text-gray-500 text-xs font-semibold tracking-[0.2em] uppercase">
                    Developed By <span className="text-cyan-500 ml-1 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">Purusharth Jain</span>
                </p>
                <p className="text-gray-600 text-[10px] tracking-widest uppercase">
                    All rights reserved
                </p>
            </footer>
        </div>
    );
};

export default App;
