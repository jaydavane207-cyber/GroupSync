import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';

export default function Payments() {
  const { user, showToast } = useAppContext();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
  }, 0);

  const handleTransaction = async (type, desc, amt) => {
    const numAmt = parseFloat(amt);
    if (isNaN(numAmt) || numAmt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      profile_id: user.id,
      amount: numAmt,
      description: desc,
      type: type
    });

    if (!error) {
      showToast(`${type === 'income' ? 'Added' : 'Sent'} $${numAmt.toFixed(2)} successfully!`, 'success');
      fetchTransactions();
      setAmount('');
    } else {
      showToast('Transaction failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2.5 text-[var(--color-gs-text-main)]">
            <Wallet className="text-blue-500" size={24} /> Payments & Spending
          </h1>
          <p className="text-xs text-[var(--color-gs-text-muted)] mt-1">Manage split payments, hackathon fees, and budgets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Wallet Balance Card */}
           <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl p-6 shadow-sm">
             <div className="flex justify-between items-start mb-6">
               <div>
                 <p className="text-xs font-medium text-[var(--color-gs-text-muted)] mb-1">Total Balance</p>
                 <h2 className="text-3xl font-bold text-[var(--color-gs-text-main)]">${balance.toFixed(2)}</h2>
               </div>
               <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                 <CreditCard size={20} />
               </div>
             </div>
             
             <div className="flex flex-col gap-3">
               <input 
                 type="number" 
                 value={amount} 
                 onChange={(e) => setAmount(e.target.value)} 
                 placeholder="Enter Amount"
                 className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-[var(--color-gs-text-main)]"
               />
               <div className="flex gap-3">
                 <button onClick={() => handleTransaction('income', 'Funds Added', amount)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                   <ArrowDownRight size={16} /> Add Funds
                 </button>
                 <button onClick={() => handleTransaction('expense', 'Funds Sent', amount)} className="flex-1 py-2.5 bg-[var(--color-gs-bg)] text-[var(--color-gs-text-main)] border border-[var(--color-gs-border)] font-medium text-sm rounded-lg flex items-center justify-center gap-1.5 hover:bg-[var(--color-gs-border)]/50 transition-colors">
                   <ArrowUpRight size={16} /> Send
                 </button>
               </div>
             </div>
           </div>

           {/* Split Bills */}
           <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] p-6 rounded-xl shadow-sm">
              <h3 className="text-base font-semibold mb-4 text-[var(--color-gs-text-main)]">Pending Split Bills</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center"><DollarSign size={18}/></div>
                     <div>
                       <h4 className="font-medium text-sm text-[var(--color-gs-text-main)]">Pizza for Game Jam</h4>
                       <p className="text-xs text-[var(--color-gs-text-muted)]">Split with Alice and Bob</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-semibold text-xs text-amber-500 mb-1">Owe $12.50</p>
                     <button onClick={() => showToast('Paid $12.50 (Mock)')} className="text-xs px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium transition-colors">Pay Now</button>
                   </div>
                </div>
              </div>
           </div>

        </div>

        <div className="space-y-6">
           <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] p-6 rounded-xl shadow-sm">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-[var(--color-gs-text-main)]"><TrendingUp size={18} className="text-blue-500" /> Spending Tracker</h3>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--color-gs-text-muted)]">Monthly Budget</span>
                  <span className="font-medium text-[var(--color-gs-text-main)]">$150 / $200</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-gs-bg)] rounded-full overflow-hidden border border-[var(--color-gs-border)]">
                  <div className="h-full bg-blue-600 rounded-full w-[75%]"></div>
                </div>
                <p className="text-[11px] text-[var(--color-gs-text-muted)] mt-1.5 flex items-center gap-1"><AlertTriangle size={12} className="text-amber-500"/> Near alert threshold</p>
              </div>

              <div className="space-y-3">
                 <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gs-text-muted)]">Recent Transactions</h4>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                       <Loader2 size={20} className="animate-spin text-blue-500" />
                       <p className="text-xs text-[var(--color-gs-text-muted)]">Syncing ledger...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-[var(--color-gs-text-muted)] py-4 text-center">No transactions yet.</p>
                  ) : transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-[var(--color-gs-border)] last:border-0">
                      <div>
                        <p className="text-sm font-bold">{t.description}</p>
                        <p className="text-xs text-[var(--color-gs-text-muted)]">
                          {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${t.type === 'income' ? 'text-[var(--color-gs-green)]' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

