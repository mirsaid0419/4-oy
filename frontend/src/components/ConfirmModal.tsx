import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Tasdiqlash',
    cancelText = 'Bekor qilish',
    type = 'danger'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="confirm-modal-overlay" onClick={onCancel}>
                    <motion.div
                        className="confirm-modal-content glass-morphism"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className={`icon-box ${type}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <button className="close-btn" onClick={onCancel}><X size={18} /></button>
                        </div>

                        <div className="modal-body">
                            <h3>{title}</h3>
                            <p>{message}</p>
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={onCancel}>{cancelText}</button>
                            <button
                                className={`confirm-btn ${type === 'danger' ? 'danger-bg' : 'gradient-bg'}`}
                                onClick={() => {
                                    onConfirm();
                                    onCancel();
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>

                    <style>{`
                        .confirm-modal-overlay {
                            position: fixed;
                            top: 0; left: 0; right: 0; bottom: 0;
                            background: rgba(0, 0, 0, 0.8);
                            backdrop-filter: blur(10px);
                            z-index: 3000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                        }
                        .confirm-modal-content {
                            width: 100%;
                            max-width: 400px;
                            padding: 30px;
                            border-radius: 24px;
                            border: 1px solid var(--glass-border);
                        }
                        .modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 20px;
                        }
                        .icon-box {
                            width: 50px;
                            height: 50px;
                            border-radius: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .icon-box.danger {
                            background: rgba(239, 68, 68, 0.1);
                            color: #ef4444;
                        }
                        .icon-box.warning {
                            background: rgba(245, 158, 11, 0.1);
                            color: #f59e0b;
                        }
                        .icon-box.info {
                            background: rgba(59, 130, 246, 0.1);
                            color: #3b82f6;
                        }
                        .close-btn {
                            background: none;
                            border: none;
                            color: var(--text-muted);
                            cursor: pointer;
                            transition: color 0.2s;
                        }
                        .close-btn:hover { color: white; }
                        
                        .modal-body h3 {
                            font-size: 1.4rem;
                            font-weight: 800;
                            margin-bottom: 10px;
                            color: white;
                        }
                        .modal-body p {
                            color: var(--text-muted);
                            line-height: 1.6;
                            font-size: 0.95rem;
                        }
                        
                        .modal-actions {
                            display: flex;
                            gap: 12px;
                            margin-top: 30px;
                        }
                        .modal-actions button {
                            flex: 1;
                            padding: 12px;
                            border-radius: 12px;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s;
                        }
                        .cancel-btn {
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid var(--glass-border);
                            color: white;
                        }
                        .cancel-btn:hover { background: rgba(255, 255, 255, 0.1); }
                        
                        .confirm-btn {
                            border: none;
                            color: white;
                        }
                        .danger-bg {
                            background: #ef4444;
                            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                        }
                        .danger-bg:hover {
                            background: #dc2626;
                            transform: translateY(-2px);
                        }
                    `}</style>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
