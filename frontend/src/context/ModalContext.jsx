import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);

  const showAlert = ({ title = 'Notice', message, type = 'info', confirmText = 'Got It', onConfirm }) => {
    setModalConfig({
      mode: 'alert',
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setModalConfig(null);
      }
    });
  };

  const showConfirm = ({ title = 'Are you sure?', message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
    setModalConfig({
      mode: 'confirm',
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setModalConfig(null);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setModalConfig(null);
      }
    });
  };

  const closeModal = () => setModalConfig(null);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      {modalConfig && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar Header */}
            <div
              style={{
                backgroundColor: modalConfig.type === 'danger' ? '#FEF2F2' : modalConfig.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {modalConfig.type === 'danger' ? (
                  <AlertTriangle size={22} style={{ color: '#DC2626' }} />
                ) : modalConfig.type === 'warning' ? (
                  <AlertTriangle size={22} style={{ color: '#D97706' }} />
                ) : (
                  <Info size={22} style={{ color: 'var(--primary-color)' }} />
                )}
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  {modalConfig.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                {modalConfig.message}
              </p>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#FAF9F5',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}
            >
              {modalConfig.mode === 'confirm' && (
                <button
                  onClick={modalConfig.onCancel}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '30px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {modalConfig.cancelText || 'Cancel'}
                </button>
              )}
              <button
                onClick={modalConfig.onConfirm}
                style={{
                  padding: '0.6rem 1.35rem',
                  borderRadius: '30px',
                  border: 'none',
                  backgroundColor: modalConfig.type === 'danger' ? '#DC2626' : 'var(--primary-color)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {modalConfig.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
