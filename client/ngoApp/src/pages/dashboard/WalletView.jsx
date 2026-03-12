import React, { useState, useEffect, useCallback } from 'react';
import './WalletView.css';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const WalletView = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchWalletInfo = useCallback(async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/payments/wallet-info`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setBalance(data.balance || 0);
                setTransactions(data.transactions || []);
            }
        } catch (err) {
            console.error("Failed to fetch wallet info:", err);
        } finally {
            setLoading(false);
        }
    }, [user.id, token]);

    useEffect(() => {
        fetchWalletInfo();
    }, [fetchWalletInfo]);

    const handleAddFunds = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/api/payments/add-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseFloat(amountToAdd) })
            });
            const data = await res.json();
            
            if (res.ok) {
                setBalance(data.newBalance);
                setSuccessMsg(`Successfully added ₹${amountToAdd} to your wallet!`);
                setShowAddModal(false);
                setAmountToAdd('');
                fetchWalletInfo(); // refresh logs
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                alert(data.error || 'Failed to add funds.');
            }
        } catch (err) {
            alert('A network error occurred.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="wallet-container">
            <div className="wallet-header">
                <div>
                  <h1 className="wallet-title">Organisation Wallet</h1>
                  <p className="wallet-subtitle">Manage your funds and pay your volunteers</p>
                </div>
                {successMsg && <div className="wallet-success-toast"><CheckCircle2 size={18}/> {successMsg}</div>}
            </div>

            <div className="wallet-balance-card">
                <div className="balance-info">
                    <span className="balance-label">Available Balance</span>
                    <h2 className="balance-amount">₹{parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                </div>
                <button className="add-funds-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} /> Add Funds
                </button>
            </div>

            <div className="wallet-history-section">
                <div className="history-header">
                    <h3>Recent Transactions</h3>
                    <button className="refresh-btn" onClick={fetchWalletInfo}><RefreshCw size={18}/></button>
                </div>

                {loading ? (
                    <div className="wallet-loading">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="wallet-empty">No transactions found.</div>
                ) : (
                    <div className="transaction-list">
                        {transactions.map(tx => (
                            <div className="transaction-item" key={tx.id}>
                                <div className="tx-icon">
                                    {tx.type === 'ngo_deposit' ? <ArrowDownRight className="tx-in" /> : <ArrowUpRight className="tx-out" />}
                                </div>
                                <div className="tx-details">
                                    <div className="tx-desc">{tx.description}</div>
                                    <div className="tx-date">{new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                </div>
                                <div className={`tx-amount ${tx.type === 'ngo_deposit' ? 'positive' : 'negative'}`}>
                                    {tx.type === 'ngo_deposit' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Funds Modal */}
            {showAddModal && (
                <div className="wallet-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="wallet-modal" onClick={e => e.stopPropagation()}>
                        <h2>Top Up Wallet</h2>
                        <p>Simulate adding funds to your NGO wallet to reward volunteers.</p>
                        <form onSubmit={handleAddFunds}>
                            <div className="amount-input-wrapper">
                                <IndianRupee size={24} className="rupee-icon" />
                                <input 
                                    type="number" 
                                    min="10" 
                                    max="1000000"
                                    value={amountToAdd}
                                    onChange={(e) => setAmountToAdd(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="preset-amounts">
                                <button type="button" onClick={() => setAmountToAdd('1000')}>₹1,000</button>
                                <button type="button" onClick={() => setAmountToAdd('5000')}>₹5,000</button>
                                <button type="button" onClick={() => setAmountToAdd('10000')}>₹10,000</button>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={processing || !amountToAdd}>
                                    {processing ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletView;
