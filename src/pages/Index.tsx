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
  const [modalStep, setModalStep] = useState<2 | 3 | 4 | 5 | 6 | 7 | 8 | null>(null);
  const [fromNoNumber, setFromNoNumber] = useState(false);
  const [migrationChecks, setMigrationChecks] = useState({
    doc: false,
    twofa: false
  });
  const [connectChecks, setConnectChecks] = useState({
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [previousStep, setPreviousStep] = useState<2 | 3 | 4 | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugResponse, setDebugResponse] = useState<'success' | 'cancel' | null>(null);
  const [testMessage, setTestMessage] = useState({
    recipient: '',
    body: 'Welcome to Netcore Cloud! This is a test message to verify your WhatsApp sender registration. Thank you for choosing Netcore Cloud for your messaging needs.'
  });
  const [sendingTest, setSendingTest] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Helper to add log with timestamp
  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    logsRef.current.push(`[${timestamp}] ${msg}`);
    setLogsUpdated(c => c + 1); // force update
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
        appId: '878254782770621',
        // your app ID goes here
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v22.0' // Graph API version goes here
      });
    };

    // Session logging message event listener
    const messageListener = event => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('message event: ', data); // remove after testing
          addLog('message event: ' + JSON.stringify(data));

          // Check if the event is FINISH
          if (data.event === 'FINISH') {
            // Reset button loading state
            setButtonLoading(false);
            // Show loading state
            setShowModal(true);
            setModalStep(5);
            setLoadingStep(0);

            // Show status messages for 2 seconds each
            setTimeout(() => {
              setLoadingStep(1);
            }, 4000);
            setTimeout(() => {
              setLoadingStep(2);
            }, 8000);
            setTimeout(() => {
              setLoadingStep(3);
            }, 12000);
            setTimeout(() => {
              setLoadingStep(4);
            }, 16000);

            // After 5 more seconds (total 13 seconds), show success message
            setTimeout(() => {
              setModalStep(6);
            }, 20000);
          }

          // Check if the event is CANCEL or status is unknown
          if (data.event === 'CANCEL' || data.status === 'unknown') {
            // Reset button loading state
            setButtonLoading(false);
            // Show error state
            setShowModal(true);
            setModalStep(7);
          }
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
  const fbLoginCallback = response => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log('response: ', code); // remove after testing
      addLog('\n\n\n\n');
      addLog('response: ' + code);
      // your code goes here
    } else {
      console.log();
      console.log('response: ', response); // remove after testing
      addLog('response: ' + JSON.stringify(response));
      // your code goes here
    }
  };

  // Launch method and callback registration
  const launchWhatsAppSignup = (featureTypeOverride: string) => {
    if (window.FB) {
      window.FB.login(fbLoginCallback, {
        config_id: '620211464432923',
        // your configuration ID goes here
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
          sessionInfoVersion: '3'
        }
      });
    } else {
      console.error('Facebook SDK not loaded');
    }
  };

  // Second modal options
  const handleConnectOutsideInfobip = () => {
    setModalStep(4);
    setConnectChecks({
      confirm: false
    });
  };
  const handleMigrateNumber = () => {
    setModalStep(3);
    setMigrationChecks({
      doc: false,
      twofa: false
    });
  };

  // Connect modal actions
  const handleConnectLogin = () => {
    setButtonLoading(true);
    setPreviousStep(4);
    if (debugMode && debugResponse) {
      // Simulate response after a short delay
      setTimeout(() => simulateESResponse(), 1000);
    } else {
      setTimeout(() => launchWhatsAppSignup(""), 0);
    }
  };

  // Migration modal actions
  const handleMigrationLogin = () => {
    setButtonLoading(true);
    setPreviousStep(3);
    if (debugMode && debugResponse) {
      // Simulate response after a short delay
      setTimeout(() => simulateESResponse(), 1000);
    } else {
      setTimeout(() => launchWhatsAppSignup(""), 0);
    }
  };

  // Try again handler
  const handleTryAgain = () => {
    setButtonLoading(false);
    setModalStep(previousStep);
  };

  // Send test message handler
  const handleSendTestMessage = () => {
    if (!testMessage.recipient || !testMessage.body) {
      setSnackbarMessage('Please fill in both recipient number and message body');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }
    setSendingTest(true);

    // Simulate sending test message (replace with actual API call)
    setTimeout(() => {
      setSendingTest(false);
      setSnackbarMessage('Test message sent successfully!');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      setTestMessage({
        recipient: '',
        body: 'Welcome to Netcore Cloud! This is a test message to verify your WhatsApp sender registration. Thank you for choosing Netcore Cloud for your messaging needs.'
      });
    }, 2000);
  };

  // Debug mode response simulator
  const simulateESResponse = () => {
    if (debugResponse === 'success') {
      const successResponse = {
        data: {
          phone_number_id: 'PHONE_NUMBER_ID_' + Math.random().toString(36).substr(2, 9),
          waba_id: 'WABA_ID_' + Math.random().toString(36).substr(2, 9),
          business_id: 'BUSINESS_ID_' + Math.random().toString(36).substr(2, 9)
        },
        type: 'WA_EMBEDDED_SIGNUP',
        event: 'FINISH'
      };

      // Simulate the message event
      const event = {
        origin: 'https://www.facebook.com',
        data: JSON.stringify(successResponse)
      };

      // Trigger the message listener
      const messageListener = event => {
        if (!event.origin.endsWith('facebook.com')) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'WA_EMBEDDED_SIGNUP') {
            console.log('message event: ', data);
            addLog('message event: ' + JSON.stringify(data));

            // Check if the event is FINISH
            if (data.event === 'FINISH') {
              // Reset button loading state
              setButtonLoading(false);
              // Show loading state
              setShowModal(true);
              setModalStep(5);
              setLoadingStep(0);

              // Show status messages for 2 seconds each
              setTimeout(() => {
                setLoadingStep(1);
              }, 4000);
              setTimeout(() => {
                setLoadingStep(2);
              }, 8000);
              setTimeout(() => {
                setLoadingStep(3);
              }, 12000);
              setTimeout(() => {
                setLoadingStep(4);
              }, 16000);

              // After 5 more seconds (total 13 seconds), show success message
              setTimeout(() => {
                setModalStep(6);
              }, 20000);
            }

            // Check if the event is CANCEL or status is unknown
            if (data.event === 'CANCEL' || data.status === 'unknown') {
              // Reset button loading state
              setButtonLoading(false);
              // Show error state
              setShowModal(true);
              setModalStep(7);
            }
          }
        } catch {
          console.log('message event: ', event.data);
          addLog('message event: ' + event.data);
        }
      };
      messageListener(event);
    } else if (debugResponse === 'cancel') {
      const cancelResponse = {
        data: {
          current_step: "BUSINESS_ACCOUNT_SELECTION"
        },
        type: "WA_EMBEDDED_SIGNUP",
        event: "CANCEL",
        version: "3"
      };

      // Simulate the message event
      const event = {
        origin: 'https://www.facebook.com',
        data: JSON.stringify(cancelResponse)
      };

      // Trigger the message listener
      const messageListener = event => {
        if (!event.origin.endsWith('facebook.com')) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'WA_EMBEDDED_SIGNUP') {
            console.log('message event: ', data);
            addLog('message event: ' + JSON.stringify(data));

            // Check if the event is FINISH
            if (data.event === 'FINISH') {
              // Reset button loading state
              setButtonLoading(false);
              // Show loading state
              setShowModal(true);
              setModalStep(5);
              setLoadingStep(0);

              // Show status messages for 2 seconds each
              setTimeout(() => {
                setLoadingStep(1);
              }, 4000);
              setTimeout(() => {
                setLoadingStep(2);
              }, 8000);
              setTimeout(() => {
                setLoadingStep(3);
              }, 12000);
              setTimeout(() => {
                setLoadingStep(4);
              }, 16000);

              // After 5 more seconds (total 13 seconds), show success message
              setTimeout(() => {
                setModalStep(6);
              }, 20000);
            }

            // Check if the event is CANCEL or status is unknown
            if (data.event === 'CANCEL' || data.status === 'unknown') {
              // Reset button loading state
              setButtonLoading(false);
              // Show error state
              setShowModal(true);
              setModalStep(7);
            }
          }
        } catch {
          console.log('message event: ', event.data);
          addLog('message event: ' + event.data);
        }
      };
      messageListener(event);
    }
  };

  // Open modal
  const openRegisterModal = () => {
    setShowModal(true);
    setModalStep(2);
    setFromNoNumber(false);
    setMigrationChecks({
      doc: false,
      twofa: false
    });
    setConnectChecks({
      confirm: false
    });
    setLoadingStep(0);
    setButtonLoading(false);
    setPreviousStep(null);
    setDebugMode(false);
    setDebugResponse(null);
    setTestMessage({
      recipient: '',
      body: 'Welcome to Netcore Cloud! This is a test message to verify your WhatsApp sender registration. Thank you for choosing Netcore Cloud for your messaging needs.'
    });
    setSendingTest(false);
    setShowSnackbar(false);
  };

  // Download logs as txt file
  const downloadLogs = () => {
    const blob = new Blob([logsRef.current.join('\n')], {
      type: 'text/plain'
    });
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
  return <>
      {/* Header with Netcore logo */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <img src="/netcore-logo.svg" alt="Netcore" className="h-8" />
        </div>
      </header>

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
          color: #000000;
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
          color: #143F93;
          background: none;
          border: 1px solid #143F93;
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        /* Custom checkbox styles */
        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #143F93;
          border-radius: 3px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .custom-checkbox.checked {
          background: #143F93;
          border-color: #143F93;
        }
        
        .custom-checkbox .checkmark {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .modal-link-btn:hover {
          background-color: #143F93;
          color: white;
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
          accent-color: #143F93;
          width: 18px;
          height: 18px;
          border: 2px solid #143F93;
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
          background-color: #143F93;
          border: 0;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 16px;
          font-weight: 500;
          height: 40px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
          justify-content: center;
        }
        .migration-login-btn:disabled {
          background: #e4e6eb;
          color: #bdbdbd;
          cursor: not-allowed;
          opacity: 1;
        }
        .migration-login-btn.loading {
          background: #e4e6eb;
          color: #bdbdbd;
          cursor: not-allowed;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(1.1); }
          60% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
      {/* Welcome Section */}
      <div className="bg-white border-b border-gray-200 mx-[24px] my-[20px] px-[32px] py-0">
        <div className="mx-6 py-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-black mb-2">
                👋 Welcome to Netcore Cloud!
              </h1>
              <p className="text-gray-600">
                Let's set up your WhatsApp Business sender so you can start sending messages.
              </p>
            </div>
            <button onClick={openRegisterModal} className="ml-6 bg-[#143F93] text-white rounded-lg font-medium hover:bg-[#0f3578] transition-colors whitespace-nowrap py-[12px] px-[24px] mx-[2px] my-[12px]">
              Get started
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center" style={{
      background: '#F4F8FF'
    }}>
        <div className="w-full max-w-md px-6">
          <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] p-8 text-center">
            <div style={{
            marginTop: 16
          }}>
              <Button onClick={downloadLogs} variant="outline" style={{
              borderColor: '#143F93',
              color: '#143F93'
            }}>Download logs</Button>
            </div>
            {/* Modal Popup */}
            {showModal && <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(33,33,33,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
                <div className="custom-modal-animate" style={{
              background: '#fff',
              borderRadius: 8,
              padding: 32,
              minWidth: 480,
              maxWidth: 560,
              boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
              textAlign: 'left',
              position: 'relative'
            }}>
                  {/* Close button */}
                  <button onClick={() => {
                setShowModal(false);
                setModalStep(null);
              }} style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#000000',
                cursor: 'pointer'
              }} aria-label="Close">×</button>

                  {/* Step 2: Connect number options */}
                  {modalStep === 2 && <>
                      <div className="modal-title">Register a WhatsApp sender</div>
                      <div className="modal-desc">To connect WhatsApp with <b>Netcore Cloud</b>, you'll need a phone number. Choose one of the options below to get started.</div>
                      <div className="option-card" onClick={handleConnectOutsideInfobip}>
                        <span className="option-icon" style={{
                    color: '#ff6d00'
                  }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#ff6d00" strokeWidth="1.5" /><path d="M8 12h8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 8v8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Connect a number you have outside of Netcore Cloud</div>
                          <div className="option-desc">You will need to delete any existing WhatsApp accounts connected to the number. Verification with SMS or phone call required.</div>
                        </div>
                      </div>
                      <div className="option-card" onClick={handleMigrateNumber}>
                        <span className="option-icon" style={{
                    color: '#ff6d00'
                  }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#ff6d00" strokeWidth="1.5" /><path d="M8 12h8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 8v8" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round" /><path d="M6 18l12-12" stroke="#ff6d00" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        </span>
                        <div className="option-content">
                          <div className="option-title">Migrate a number from another WhatsApp solution provider or another WhatsApp Business Account</div>
                          <div className="option-desc">Use this option to transfer the number from another solution provider or an existing WhatsApp Business Account (WABA) set up on Netcore Cloud.</div>
                        </div>
                      </div>
                      <div className="modal-actions">
                      </div>
                    </>}
                  {/* Step 3: Migration details */}
                  {modalStep === 3 && <>
                      <div className="modal-title">Migrate a number from another WhatsApp solution provider or another WhatsApp Business Account</div>
                      <div className="modal-desc" style={{
                  marginBottom: 18
                }}>
                        Log in with Facebook to start migrating the number from another solution provider or an existing WhatsApp Business Account (WABA) set up on Netcore Cloud. Be aware that number migration carries certain risks.
                      </div>
                      <div className="migration-warning">
                        <span className="migration-warning-icon">⚠️</span>
                        <div>
                          <b>Disable 2FA</b><br />
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
                        <input type="checkbox" id="doc-check" checked={migrationChecks.doc} onChange={e => setMigrationChecks(c => ({
                    ...c,
                    doc: e.target.checked
                  }))} />
                        <label htmlFor="doc-check">I read the <a href="https://developers.facebook.com/docs/whatsapp/migration" target="_blank" rel="noopener noreferrer" style={{
                      color: '#ff6d00',
                      textDecoration: 'underline'
                    }}>Meta documentation</a> and know the potential risks of migrating numbers between providers.</label>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="2fa-check" checked={migrationChecks.twofa} onChange={e => setMigrationChecks(c => ({
                    ...c,
                    twofa: e.target.checked
                  }))} />
                        <label htmlFor="2fa-check">I disabled 2FA on my old provider <a href="https://www.facebook.com/business/help/152651581095145" target="_blank" rel="noopener noreferrer" style={{
                      color: '#ff6d00',
                      textDecoration: 'underline'
                    }}>as required by Meta</a></label>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="debug-check" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} />
                        <label htmlFor="debug-check">Debug Mode (Simulate ES Flow Response)</label>
                      </div>
                      {debugMode && <div style={{
                  marginTop: 10,
                  padding: 10,
                  background: '#f5f5f5',
                  borderRadius: 4
                }}>
                          <div style={{
                    marginBottom: 8,
                    fontWeight: 'bold'
                  }}>Select Response Type:</div>
                          <div className="migration-checkbox">
                            <input type="radio" id="success-radio" name="debugResponse" checked={debugResponse === 'success'} onChange={() => setDebugResponse('success')} />
                            <label htmlFor="success-radio">Success Response (FINISH event)</label>
                          </div>
                          <div className="migration-checkbox">
                            <input type="radio" id="cancel-radio" name="debugResponse" checked={debugResponse === 'cancel'} onChange={() => setDebugResponse('cancel')} />
                            <label htmlFor="cancel-radio">Cancel Response (CANCEL event)</label>
                          </div>
                        </div>}
                      <div className="migration-actions">
                        <button className="modal-link-btn" onClick={() => setModalStep(2)}>BACK</button>
                        <button className={`migration-login-btn ${buttonLoading ? 'loading' : ''}`} disabled={!(migrationChecks.doc && migrationChecks.twofa) || buttonLoading} onClick={handleMigrationLogin}>
                          {buttonLoading ? <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                              <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #bdbdbd',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                              <span>Loading...</span>
                            </div> : <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" /><text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1877f2">f</text></svg>
                              <span>Login With Facebook</span>
                            </>}
                        </button>
                      </div>
                    </>}
                  {/* Step 4: Connect warning screen */}
                  {modalStep === 4 && <>
                      <div className="modal-title">Login with Facebook to register a sender</div>
                      <div className="modal-desc">
                        If your number was not connected to a WhatsApp account, you are ready to log in with Facebook to start the registration process.
                      </div>
                      <div className="migration-warning">
                        <span className="migration-warning-icon">⚠️</span>
                        <div>
                          <b>Before you continue</b><br />
                          If your number was connected to a personal WhatsApp account or WhatsApp Business App, make sure to delete your account before you continue. If you do not do this, your sender could be banned by Meta. <a href="https://www.facebook.com/business/help/152651581095145" target="_blank" rel="noopener noreferrer" style={{
                      color: '#ff6d00',
                      textDecoration: 'underline'
                    }}>Learn how to delete account</a>
                        </div>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="confirm-check" checked={connectChecks.confirm} onChange={e => setConnectChecks(c => ({
                    ...c,
                    confirm: e.target.checked
                  }))} />
                        <label htmlFor="confirm-check">I confirm the number I want to use is not connected to a WhatsApp account.</label>
                      </div>
                      <div className="migration-checkbox">
                        <input type="checkbox" id="debug-check-connect" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} />
                        <label htmlFor="debug-check-connect">Debug Mode (Simulate ES Flow Response)</label>
                      </div>
                      {debugMode && <div style={{
                  marginTop: 10,
                  padding: 10,
                  background: '#f5f5f5',
                  borderRadius: 4
                }}>
                          <div style={{
                    marginBottom: 8,
                    fontWeight: 'bold'
                  }}>Select Response Type:</div>
                          <div className="migration-checkbox">
                            <input type="radio" id="success-radio-connect" name="debugResponse-connect" checked={debugResponse === 'success'} onChange={() => setDebugResponse('success')} />
                            <label htmlFor="success-radio-connect">Success Response (FINISH event)</label>
                          </div>
                          <div className="migration-checkbox">
                            <input type="radio" id="cancel-radio-connect" name="debugResponse-connect" checked={debugResponse === 'cancel'} onChange={() => setDebugResponse('cancel')} />
                            <label htmlFor="cancel-radio-connect">Cancel Response (CANCEL event)</label>
                          </div>
                        </div>}
                      <div className="migration-actions">
                        <button className="modal-link-btn" onClick={() => setModalStep(2)}>BACK</button>
                        <button className={`migration-login-btn ${buttonLoading ? 'loading' : ''}`} disabled={!connectChecks.confirm || buttonLoading} onClick={handleConnectLogin}>
                          {buttonLoading ? <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                              <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #bdbdbd',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                              <span>Loading...</span>
                            </div> : <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" /><text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1877f2">f</text></svg>
                              <span>Login With Facebook</span>
                            </>}
                        </button>
                      </div>
                    </>}
                  {/* Step 5: Loading state */}
                  {modalStep === 5 && <>
                      <div className="modal-title">Registering with Meta and Netcore Cloud...</div>
                      <div style={{
                  textAlign: 'center',
                  padding: '40px 0'
                }}>
                        <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #ff6d00',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}></div>
                        <div style={{
                    color: '#666',
                    fontSize: '16px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                          {loadingStep >= 0 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32'
                      }}>✓</span>
                              Getting your business token...
                            </div>}
                          {loadingStep >= 1 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32'
                      }}>✓</span>
                              Subscribing to webhooks
                            </div>}
                          {loadingStep >= 2 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32'
                      }}>✓</span>
                              Extending credit line
                            </div>}
                          {loadingStep >= 3 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32'
                      }}>✓</span>
                              Registering the phone number
                            </div>}
                          {loadingStep >= 4 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32'
                      }}>✓</span>
                              Finalizing registration...
                            </div>}
                        </div>
                      </div>
                    </>}
                  {/* Step 6: Success state */}
                  {modalStep === 6 && <>
                      <div className="modal-title" style={{
                  color: '#000000'
                }}>WhatsApp registration completed successfully!</div>
                      <div style={{
                  textAlign: 'center',
                  padding: '40px 0'
                }}>
                        <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '40px',
                    color: 'white',
                    animation: 'bounce 1s ease-in-out'
                  }}>✓</div>
                        <p style={{
                    color: '#666',
                    fontSize: '16px'
                  }}>Your WhatsApp sender has been successfully registered with Meta and Netcore Cloud.</p>
                      </div>
                      <div className="modal-actions">
                        <button className="modal-link-btn" onClick={() => {
                    setShowModal(false);
                    setModalStep(null);
                    setIsLoading(false);
                    setIsSuccess(false);
                  }}>CLOSE</button>
                         <button onClick={() => setModalStep(8)} style={{
                    backgroundColor: '#143F93',
                    border: 0,
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500',
                    height: '40px',
                    padding: '0 24px'
                  }}>
                          Send Test Message
                        </button>
                      </div>
                    </>}
                  {/* Step 7: Error state */}
                  {modalStep === 7 && <>
                      <div className="modal-title" style={{
                  color: '#000000'
                }}>Registration interrupted!</div>
                      <div style={{
                  textAlign: 'center',
                  padding: '40px 0'
                }}>
                        <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#d32f2f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '40px',
                    color: 'white',
                    animation: 'shake 0.5s ease-in-out'
                  }}>✕</div>
                        <p style={{
                    color: '#666',
                    fontSize: '16px'
                  }}>The registration process was interrupted. Please try again to complete your WhatsApp sender registration.</p>
                      </div>
                      <div className="modal-actions">
                         <button onClick={handleTryAgain} style={{
                    backgroundColor: '#143F93',
                    border: 0,
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500',
                    height: '40px',
                    padding: '0 24px'
                  }}>
                          Try Again
                        </button>
                      </div>
                    </>}
                  {/* Step 8: Test Message */}
                  {modalStep === 8 && <>
                      <div className="modal-title">Send a test message</div>
                      <div className="modal-desc">
                        If you wish to send a test message to yourself, you can do it here.
                      </div>
                      <div style={{
                  marginBottom: 20
                }}>
                        <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                          Recipient WhatsApp Number:
                        </label>
                        <input type="text" placeholder="911234567890" value={testMessage.recipient} onChange={e => setTestMessage(prev => ({
                    ...prev,
                    recipient: e.target.value
                  }))} style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }} />
                      </div>
                      <div style={{
                  marginBottom: 20
                }}>
                        <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                          Message Body:
                        </label>
                        <textarea placeholder="Enter your test message here..." value={testMessage.body} onChange={e => setTestMessage(prev => ({
                    ...prev,
                    body: e.target.value
                  }))} readOnly style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    minHeight: '100px',
                    resize: 'none',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    cursor: 'not-allowed'
                  }} />
                      </div>
                      <div className="modal-actions">
                        <button className="modal-link-btn" onClick={() => {
                    setShowModal(false);
                    setModalStep(null);
                    setTestMessage({
                      recipient: '',
                      body: 'Welcome to Netcore Cloud! This is a test message to verify your WhatsApp sender registration. Thank you for choosing Netcore Cloud for your messaging needs.'
                    });
                  }}>CLOSE</button>
                         <button onClick={handleSendTestMessage} disabled={sendingTest || !testMessage.recipient || !testMessage.body} style={{
                    backgroundColor: sendingTest ? '#ccc' : '#143F93',
                    border: 0,
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: sendingTest ? 'not-allowed' : 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500',
                    height: '40px',
                    padding: '0 24px'
                  }}>
                          {sendingTest ? 'Sending...' : 'Send Test Message'}
                        </button>
                      </div>
                    </>}

                </div>
              </div>}
          </div>
        </div>
      </div>
      {/* Snackbar */}
      {showSnackbar && <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#2e7d32',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 10000,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
          <span style={{
        fontSize: '16px'
      }}>✓</span>
          {snackbarMessage}
        </div>}
    </>;
};
export default Index;

// ngrok http --domain=willingly-nice-deer.ngrok-free.app 8080