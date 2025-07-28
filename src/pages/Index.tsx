import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Add these lines to extend the Window interface for TypeScript
declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

const Index = () => {
  // Store logs in a ref so they persist across renders but don't cause rerenders
  const logsRef = useRef<string[]>([]);
  // State to force update when logs change (for download button to update)
  const [, setLogsUpdated] = useState(0);
  // Remove featureType state, use direct value passing
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | null>(null);
  const [fromNoNumber, setFromNoNumber] = useState(false);
  const [migrationChecks, setMigrationChecks] = useState({ doc: false, twofa: false, mmlite: false });

  // Helper to add log with timestamp
  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    logsRef.current.push(`[${timestamp}] ${msg}`);
    setLogsUpdated((c) => c + 1); // force update
  };

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    document.body.appendChild(script);

    // SDK initialization
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '878254782770621', // your app ID goes here
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v22.0' // Graph API version goes here
      });
    };

    // Session logging message event listener
    const messageListener = (event) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('message event: ', data); // remove after testing
          addLog('message event: ' + JSON.stringify(data));
          // your code goes here
        }
      } catch {
        console.log('message event: ', event.data); // remove after testing
        addLog('message event: ' + event.data);
        // your code goes here
      }
    };
    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);

  // Response callback
  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log('response: ', code); // remove after testing
      addLog('\n\n\n\n');
      addLog('response: ' + code);
      // your code goes here
    } else {
      console.log('response: ', response); // remove after testing
      addLog('response: ' + JSON.stringify(response));
      // your code goes here
    }
  };

  // Launch method and callback registration
  const launchWhatsAppSignup = (featureTypeOverride: string) => {
    if (window.FB) {
      window.FB.login(fbLoginCallback, {
        config_id: '620211464432923', // your configuration ID goes here
        response_type: 'code',
        override_default_response_type: true,
        extras: {
        //   features: [
        //     {
        //       name: "marketing_messages_lite",
        //     }
        //   ],
          setup: {},
          featureType: featureTypeOverride,
          sessionInfoVersion: '3',
        }
      });
    } else {
      console.error('Facebook SDK not loaded');
    }
  };

  // Handler for modal options
  const handleBuyNewNumber = () => {
    setShowModal(false); // Do nothing, just close
  };
  const handleConnectExisting = () => {
    setFromNoNumber(false);
    setModalStep(2);
  };
  const handleContinueWithoutNumber = () => {
    setShowModal(false);
    setModalStep(null);
    setTimeout(() => launchWhatsAppSignup("only_waba_sharing"), 0);
  };

  // Second modal options
  const handleConnectOutsideInfobip = () => {
    setShowModal(false);
    setModalStep(null);
    setTimeout(() => launchWhatsAppSignup(fromNoNumber ? "only_waba_sharing" : ""), 0);
  };
  const handleMigrateNumber = () => {
    setModalStep(3);
    setMigrationChecks({ doc: false, twofa: false, mmlite: false });
  };

  // Migration modal actions
  const handleMigrationLogin = () => {
    let ft = "";
    if (migrationChecks.mmlite) {
      ft = "marketing_messages_lite";
    } else if (fromNoNumber) {
      ft = "only_waba_sharing";
    }
    setShowModal(false);
    setModalStep(null);
    setTimeout(() => launchWhatsAppSignup(ft), 0);
  };

  // Open modal
  const openRegisterModal = () => {
    setShowModal(true);
    setModalStep(1);
    setFromNoNumber(false);
    setMigrationChecks({ doc: false, twofa: false, mmlite: false });
  };

  // Download logs as txt file
  const downloadLogs = () => {
    const blob = new Blob([logsRef.current.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .custom-modal-animate {
          animation: modalFadeIn 0.35s cubic-bezier(0.4,0,0.2,1);
          max-height: 90vh;
          overflow-y: auto;
        }
        .option-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px 24px;
          margin-bottom: 18px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #fff;
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .option-card:hover:not(.disabled) {
          box-shadow: 0 2px 8px rgba(255,109,0,0.13);
        }
        .option-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .option-icon {
          font-size: 28px;
          margin-top: 2px;
        }
        .option-content {
          flex: 1;
        }
        .option-title {
          font-weight: 600;
          font-size: 17px;
          margin-bottom: 2px;
          color: #212121;
        }
        .option-desc {
          color: #555;
          font-size: 15px;
        }
        .modal-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ff6d00;
        }
        .modal-desc {
          color: #444;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 24px;
          margin-top: 18px;
        }
        .modal-link-btn {
          color: #ff6d00;
          background: none;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          text-decoration: underline;
        }
        .migration-warning {
          background: #fff7e0;
          border: 1px solid #ffe6b3;
          border-radius: 8px;
          padding: 18px 20px;
          margin-bottom: 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .migration-warning-icon {
          color: #ffb300;
          font-size: 22px;
          margin-top: 2px;
        }
        .migration-section {
          margin-bottom: 18px;
        }
        .migration-section-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .migration-section-title .check {
          color: #2e7d32;
          font-size: 18px;
        }
        .migration-section-title .warn {
          color: #ffb300;
          font-size: 18px;
        }
        .migration-list {
          margin: 0 0 0 18px;
          padding: 0;
          color: #444;
          font-size: 15px;
        }
        .migration-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 15px;
        }
        .migration-checkbox input[type='checkbox'] {
          accent-color: #ff6d00;
          width: 18px;
          height: 18px;
        }
        .migration-actions {
          display: flex;
          justify-content: flex-end;
          gap: 18px;
          margin-top: 24px;
          border-top: 1px solid #eee;
          padding-top: 18px;
        }
        .migration-login-btn {
          background: #ff6d00;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 16px;
          padding: 10px 24px;
          cursor: pointer;
          opacity: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .migration-login-btn:disabled {
          background: #ffe0cc;
          color: #bdbdbd;
          cursor: not-allowed;
          opacity: 1;
        }
      `}</style>
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ background: 'linear-gradient(135deg, #fff 0%, #ffe0cc 100%)' }}
      >
        <div className="w-full max-w-md px-6">
          <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] p-8 text-center" style={{border: '1.5px solid #ff6d00'}}>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2" style={{color: '#ff6d00'}}>Welcome to Netcore Cloud</h1>
              <p className="text-muted-foreground">Sign in to continue</p>
            </div>
            <button
              onClick={openRegisterModal}
              style={{backgroundColor: '#ff6d00', border: 0, borderRadius: '4px', color: '#fff', cursor: 'pointer', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '16px', fontWeight: 'bold', height: '40px', padding: '0 24px', marginBottom: 12}}
            >
              Register WhatsApp sender
            </button>
            <div style={{ marginTop: 16 }}>
              <Button onClick={downloadLogs} variant="outline" style={{borderColor: '#ff6d00', color: '#ff6d00'}}>Download logs</Button>
            </div>
            {/* Modal Popup */}
            {showModal && (
              <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(33,33,33,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                <div className="custom-modal-animate" style={{background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, maxWidth: 480, boxShadow: '0 2px 16px rgba(255,109,0,0.15)', textAlign: 'left', position: 'relative', border: '1.5px solid #ff6d00'}}>
                  {/* Close button */}
                  <button onClick={() => { setShowModal(false); setModalStep(null); }} style={{position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#ff6d00', cursor: 'pointer'}} aria-label="Close">×</button>
                  {/* Step 1: Main options */}
                  {modalStep === 1 && (
                    <>
                      <div className="modal-title">Register a WhatsApp sender</div>
                      <div className="modal-desc">To connect WhatsApp with <b>Netcore Cloud</b>, you'll need a phone number. Choose one of the options below to get started.</div>
                      <div className="option-card" onClick={handleBuyNewNumber}>
                        <span className="option-icon" style={{color: '#ff6d00'}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6.5 10.5V7.75A3.75 3.75 0 0 1 10.25 4h3.5A3.75 3.75 0 0 1 17.5 7.75v2.75" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="5" stroke="#ff6d00" strokeWidth="1.5"/><path d="M12 15v4m2-2h-4" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Buy a new number <span style={{fontWeight: 400}}>(Recommended)</span></div>
                          <div className="option-desc">Quick and easy to set up. No verification through SMS or phone call required.</div>
                        </div>
                      </div>
                      <div className="option-card" onClick={handleConnectExisting}>
                        <span className="option-icon" style={{color: '#ff6d00'}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6.5 10.5V7.75A3.75 3.75 0 0 1 10.25 4h3.5A3.75 3.75 0 0 1 17.5 7.75v2.75" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="5" stroke="#ff6d00" strokeWidth="1.5"/><path d="M12 17h0" stroke="#ff6d00" strokeWidth="2" strokeLinecap="round"/><path d="M9.5 17h5" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Connect a number you already have</div>
                          <div className="option-desc">Use a number you bought from <b>Netcore Cloud</b> or your own number. You might need to verify the number by receiving a code through SMS or a phone call.</div>
                        </div>
                      </div>
                      <div className="option-card" onClick={handleContinueWithoutNumber}>
                        <span className="option-icon" style={{color: '#ff6d00'}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="17" r="5" stroke="#ff6d00" strokeWidth="1.5"/><path d="M12 17h0" stroke="#ff6d00" strokeWidth="2" strokeLinecap="round"/><path d="M6.5 10.5V7.75A3.75 3.75 0 0 1 10.25 4h3.5A3.75 3.75 0 0 1 17.5 7.75v2.75" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Continue without a phone number</div>
                          <div className="option-desc">The phone number will have to be configured later.</div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button className="modal-link-btn" onClick={() => { setShowModal(false); setModalStep(null); }}>CANCEL</button>
                      </div>
                    </>
                  )}
                  {/* Step 2: Connect number options */}
                  {modalStep === 2 && (
                    <>
                      <div className="modal-title">Connect a number you already have</div>
                      <div className="option-card" onClick={handleConnectOutsideInfobip}>
                        <span className="option-icon" style={{color: '#ff6d00'}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#ff6d00" strokeWidth="1.5"/><path d="M8 12h8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 8v8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Connect a number you have outside of Netcore Cloud</div>
                          <div className="option-desc">You will need to delete any existing WhatsApp accounts connected to the number. Verification with SMS or phone call required.</div>
                        </div>
                      </div>
                      <div className="option-card disabled">
                        <span className="option-icon" style={{color: '#ff6d00', opacity: 0.5}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#ff6d00" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#ff6d00" strokeWidth="1.5"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title" style={{color: '#888'}}>Connect a Netcore Cloud number</div>
                          <div className="option-desc">Register a number you already bought from Netcore Cloud.</div>
                        </div>
                      </div>
                      <div className="option-card" onClick={handleMigrateNumber}>
                        <span className="option-icon" style={{color: '#ff6d00'}}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#ff6d00" strokeWidth="1.5"/><path d="M8 12h8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 8v8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 18l12-12" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Migrate a number from another WhatsApp solution provider or another WhatsApp Business Account</div>
                          <div className="option-desc">Use this option to transfer the number from another solution provider or an existing WhatsApp Business Account (WABA) set up on Netcore Cloud.</div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button className="modal-link-btn" onClick={() => { setShowModal(false); setModalStep(null); }}>CANCEL</button>
                        <button className="modal-link-btn" onClick={() => setModalStep(1)}>BACK</button>
                      </div>
                    </>
                  )}
                  {/* Step 3: Migration details */}
                  {modalStep === 3 && (
                    <>
                      <div className="modal-title">Migrate a number from another WhatsApp solution provider or another WhatsApp Business Account</div>
                      <div className="modal-desc" style={{marginBottom: 18}}>
                        Log in with Facebook to start migrating the number from another solution provider or an existing WhatsApp Business Account (WABA) set up on Netcore Cloud. Be aware that number migration carries certain risks.
                      </div>
                      <div className="migration-warning">
                        <span className="migration-warning-icon">⚠️</span>
                        <div>
                          <b>Disable 2FA</b><br/>
                          Make sure to disable two-factor authentication (2FA) in your WhatsApp account settings or ask your current solution provider to disable it for you. This is required for successful migration.
                        </div>
                      </div>
                      <div className="migration-section">
                        <div className="migration-section-title"><span className="check">✔️</span> Will be migrated:</div>
                        <ul className="migration-list">
                          <li>Display name, sender quality rating, and messaging limits</li>
                          <li>Official Business Account status</li>
                          <li>High quality templates</li>
                          <li>Messages and chat history (only for cloud senders on Meta servers)</li>
                        </ul>
                      </div>
                      <div className="migration-section">
                        <div className="migration-section-title"><span className="warn">⚠️</span> Will not be migrated:</div>
                        <ul className="migration-list">
                          <li>Low quality, rejected, or pending templates</li>
                          <li>Messages and chat history for senders hosted on local servers (please back up all conversations you want to keep)</li>
                          <li>Flows</li>
                        </ul>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="doc-check" checked={migrationChecks.doc} onChange={e => setMigrationChecks(c => ({...c, doc: e.target.checked}))} />
                        <label htmlFor="doc-check">I read the <a href="https://developers.facebook.com/docs/whatsapp/migration" target="_blank" rel="noopener noreferrer" style={{color:'#ff6d00', textDecoration:'underline'}}>Meta documentation</a> and know the potential risks of migrating numbers between providers.</label>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="2fa-check" checked={migrationChecks.twofa} onChange={e => setMigrationChecks(c => ({...c, twofa: e.target.checked}))} />
                        <label htmlFor="2fa-check">I disabled 2FA on my old provider <a href="https://www.facebook.com/business/help/152651581095145" target="_blank" rel="noopener noreferrer" style={{color:'#ff6d00', textDecoration:'underline'}}>as required by Meta</a></label>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="mmlite-check" checked={migrationChecks.mmlite} onChange={e => setMigrationChecks(c => ({...c, mmlite: e.target.checked}))} />
                        <label htmlFor="mmlite-check">I want to enable Marketing Messages Lite (MMLite) for this sender. <span style={{color:'#888', fontWeight:400}}>(optional)</span></label>
                      </div>
                      <div className="migration-actions">
                        <button className="modal-link-btn" onClick={() => { setShowModal(false); setModalStep(null); }}>CANCEL</button>
                        <button className="modal-link-btn" onClick={() => setModalStep(2)}>BACK</button>
                        <button className="migration-login-btn" disabled={!(migrationChecks.doc && migrationChecks.twofa)} onClick={handleMigrationLogin}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill="#fff"/><path d="M8 12h8M12 8v8" stroke="#1877f2" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          Login With Facebook
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
