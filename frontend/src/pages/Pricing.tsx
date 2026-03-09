import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Check, Zap, Shield, Star, CreditCard, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  subscriptionType: string;
}

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'info' | 'paying' | 'success'>('info');
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscription-plan/active');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  const initSubscribe = (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    if (plan.price === 0 || plan.subscriptionType === 'free') {
      handleFreeSubscribe(plan);
    } else {
      setShowPaymentModal(true);
      setPaymentStep('info');
      setCardNumber('');
      setError(null);
    }
  };

  const handleFreeSubscribe = async (plan: Plan) => {
    setProcessing(true);
    try {
      await api.post('/user-subscription', {
        planId: plan.id,
        autoRenew: false
      });
      alert('Free subscritpion activated!');
      navigate('/profile');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate free plan');
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async () => {
    if (cardNumber.length < 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }

    setProcessing(true);
    setError(null);
    setPaymentStep('paying');

    try {
      // 1. Create User Subscription
      const subResponse = await api.post('/user-subscription', {
        planId: selectedPlan?.id,
        paymentMethod: 'card',
        autoRenew: false
      });

      const subscriptionId = subResponse.data.id;

      // 2. Create Payment Record (simulated)
      const payResponse = await api.post(`/payment/${subscriptionId}`);
      const paymentId = payResponse.data.data.id;

      // 3. Simulate Payment Success with Callback
      // In a real app, this would happen via the payment provider
      await api.post('/payment/callback', {
        paymentId: paymentId
      });

      setPaymentStep('success');
      setTimeout(() => {
        setShowPaymentModal(false);
        navigate('/profile');
      }, 2000);

    } catch (err: any) {
      console.error('Payment failed', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      setPaymentStep('info');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <motion.h1
          className="gradient-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose Your Plan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Subscribe for unlimited access to the world of movies
        </motion.p>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={48} />
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`plan-card glass-morphism ${plan.subscriptionType === 'premium' ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.subscriptionType === 'premium' && plan.price > 0 && (
                <div className="featured-badge">MOST POPULAR</div>
              )}
              <div className="plan-icon">
                {plan.price === 0 ? <Shield size={32} /> : plan.name.toLowerCase().includes('pro') ? <Star size={32} /> : <Zap size={32} />}
              </div>
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{Number(plan.price)}</span>
                <span className="period">/{plan.durationDays} days</span>
              </div>
              <p className="plan-desc">{plan.description}</p>

              <ul className="features">
                <li><Check size={18} /> HD Streaming</li>
                <li><Check size={18} /> Multiple Devices</li>
                {plan.price > 0 && <li><Check size={18} /> Ad-Free Experience</li>}
                {plan.price > 0 && <li><Check size={18} /> Download Features</li>}
                {plan.subscriptionType === 'premium' && <li><Check size={18} /> Early Access</li>}
              </ul>

              <button
                className={`subscribe-btn ${plan.subscriptionType === 'premium' ? 'gradient-bg' : 'glass-btn'}`}
                onClick={() => initSubscribe(plan)}
                disabled={processing}
              >
                {processing && selectedPlan?.id === plan.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  plan.price === 0 ? 'Get Started' : 'Subscribe Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPlan && (
          <div className="modal-overlay" onClick={() => !processing && setShowPaymentModal(false)}>
            <motion.div
              className="payment-modal glass-morphism"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowPaymentModal(false)} disabled={processing}>
                <X size={24} />
              </button>

              {paymentStep === 'success' ? (
                <div className="success-step">
                  <div className="success-icon">
                    <Check size={48} />
                  </div>
                  <h2>Success!</h2>
                  <p>Your {selectedPlan.name} subscription is now active.</p>
                  <p className="redirect-text">Redirecting to profile...</p>
                </div>
              ) : (
                <div className="payment-content">
                  <div className="modal-header">
                    <CreditCard size={32} />
                    <h2>Checkout</h2>
                  </div>

                  <div className="order-summary">
                    <div className="order-item">
                      <span>Plan</span>
                      <strong>{selectedPlan.name}</strong>
                    </div>
                    <div className="order-item">
                      <span>Duration</span>
                      <span>{selectedPlan.durationDays} Days</span>
                    </div>
                    <div className="order-total">
                      <span>Total to Pay</span>
                      <strong>${Number(selectedPlan.price)}</strong>
                    </div>
                  </div>

                  {error && (
                    <div className="error-box">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="payment-form">
                    <div className="input-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        disabled={processing}
                      />
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Expiry</label>
                        <input type="text" placeholder="MM/YY" maxLength={5} disabled={processing} />
                      </div>
                      <div className="input-group">
                        <label>CVC</label>
                        <input type="text" placeholder="***" maxLength={3} disabled={processing} />
                      </div>
                    </div>

                    <button
                      className="pay-btn gradient-bg"
                      onClick={processPayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        `Pay $${Number(selectedPlan.price)}`
                      )}
                    </button>
                  </div>

                  <p className="secure-text">
                    <Shield size={14} /> Secure Encryption - Test Mode
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .pricing-page {
          padding: 120px 5% 60px;
          min-height: 100vh;
          background: radial-gradient(circle at top right, rgba(229, 9, 20, 0.05), transparent 40%);
        }
        .pricing-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .pricing-header h1 {
          font-size: 3.5rem;
          margin-bottom: 15px;
          font-weight: 900;
        }
        .pricing-header p {
          color: var(--text-muted);
          font-size: 1.2rem;
        }
        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .plan-card {
          padding: 50px 40px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--glass-border);
        }
        .plan-card:hover {
          transform: translateY(-15px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .plan-card.featured {
          background: linear-gradient(180deg, rgba(229, 9, 20, 0.08) 0%, rgba(229, 9, 20, 0.02) 100%);
          border-color: rgba(229, 9, 20, 0.3);
        }
        .featured-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
        }
        .plan-icon {
          width: 70px;
          height: 70px;
          background: rgba(229, 9, 20, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          color: var(--primary);
        }
        .plan-card h3 {
          font-size: 2rem;
          margin-bottom: 15px;
          font-weight: 800;
        }
        .price {
          display: flex;
          align-items: baseline;
          margin-bottom: 25px;
        }
        .currency { font-size: 1.8rem; font-weight: 600; color: var(--text-muted); }
        .amount { font-size: 3.5rem; font-weight: 900; line-height: 1; }
        .period { color: var(--text-muted); margin-left: 8px; font-weight: 600; }
        .plan-desc {
          color: var(--text-muted);
          margin-bottom: 35px;
          line-height: 1.6;
          font-size: 1.05rem;
        }
        .features {
          list-style: none;
          margin-bottom: 45px;
          flex-grow: 1;
        }
        .features li {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
        }
        .features li svg { color: #10b981; }
        .subscribe-btn {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          border: none;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .glass-btn {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid var(--glass-border);
        }
        .subscribe-btn:hover:not(:disabled) {
          transform: scale(1.02);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .payment-modal {
          width: 100%;
          max-width: 500px;
          border-radius: 32px;
          padding: 40px;
          position: relative;
          border: 1px solid var(--glass-border);
        }
        .close-modal {
          position: absolute;
          top: 25px;
          right: 25px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s;
        }
        .close-modal:hover { color: white; }
        
        .modal-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }
        .modal-header h2 { font-size: 1.8rem; font-weight: 800; }
        .modal-header svg { color: var(--primary); }

        .order-summary {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 30px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: var(--text-muted);
        }
        .order-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 1.2rem;
        }
        .order-total strong { color: var(--primary); font-size: 1.5rem; }

        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .input-group input {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
          padding: 14px;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }
        .input-group input:focus { border-color: var(--primary); }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .pay-btn {
          margin-top: 10px;
          padding: 18px;
          border-radius: 16px;
          border: none;
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .secure-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .success-step {
          text-align: center;
          padding: 40px 0;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }
        .success-step h2 { font-size: 2.5rem; margin-bottom: 10px; }
        .redirect-text { color: var(--text-muted); margin-top: 20px; font-style: italic; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Pricing;
