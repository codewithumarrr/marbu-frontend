import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

const WebAuthnButton = () => {
  const [modal, setModal] = useState({ open: false, success: false });

  const handleWebAuthn = async () => {
    try {
      // Demo options (not secure, for frontend demo only)
      const options = {
        challenge: Uint8Array.from('demo-challenge', c => c.charCodeAt(0)),
        allowCredentials: [],
        timeout: 60000,
        userVerification: 'preferred',
        rpId: window.location.hostname,
      };

      await startAuthentication(options);
      setModal({ open: true, success: true });
    } catch (err) {
      setModal({ open: true, success: false });
      console.error(err);
    }
  };

  return (
    <>
      <div
        className="thumbprint-pad"
        style={{
          border: '2px dashed #25b86f',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f9f9f9',
          marginTop: 10,
          marginBottom: 10,
          fontWeight: 600,
          fontSize: 16,
        }}
        onClick={handleWebAuthn}
      >
        <span>🔒 Authenticate with Fingerprint / Face / PIN</span>
      </div>
      {modal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '32px 40px',
            minWidth: 320,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18
          }}>
            <div style={{ fontSize: 32, color: modal.success ? '#25b86f' : '#dc2626', marginBottom: 8 }}>
              {modal.success ? '✅' : '❌'}
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>
              {modal.success ? 'Authentication successful' : 'Authentication failed or cancelled'}
            </div>
            <button onClick={() => setModal({ open: false, success: false })} style={{
              marginTop: 10,
              background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 32px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
              letterSpacing: 1
            }}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default WebAuthnButton; 