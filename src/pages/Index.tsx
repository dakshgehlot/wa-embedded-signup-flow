import { Button } from "@/components/ui/button";
import { Facebook, Link, ArrowRightLeft } from "lucide-react";
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
  const [selectedOption, setSelectedOption] = useState('');

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
    setSelectedOption('connect');
    setModalStep(4);
    setConnectChecks({
      confirm: false
    });
  };
  const handleMigrateNumber = () => {
    setSelectedOption('migrate');
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
    setSelectedOption('');
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
      {/* Modern gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-netcore-blue-light via-background to-netcore-orange-light"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--netcore-blue)/0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--netcore-orange)/0.1),transparent_70%)]"></div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-xl border-b border-border/50 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/netcore-logo.svg" 
                alt="Netcore" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-netcore-blue to-netcore-orange bg-clip-text text-transparent">
                Cloud
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={downloadLogs}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Download logs
              </Button>
              {/* Debug Mode Toggle - keeping for development */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="w-4 h-4 accent-netcore-blue rounded"
                />
                <label htmlFor="debugMode" className="text-sm text-muted-foreground">
                  Debug
                </label>
              </div>
              {debugMode && (
                <select
                  value={debugResponse || ''}
                  onChange={(e) => setDebugResponse(e.target.value as 'success' | 'cancel' | null)}
                  className="text-sm border border-input rounded-md px-2 py-1 bg-background"
                >
                  <option value="">Select Response</option>
                  <option value="success">Success</option>
                  <option value="cancel">Cancel</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-lg mx-auto">
          {/* Main Card */}
          <div className="relative">
            {/* Background blur effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-card/20 backdrop-blur-2xl rounded-3xl transform rotate-1"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-xl rounded-3xl transform -rotate-1"></div>
            
            {/* Main content card */}
            <div className="relative bg-card/90 backdrop-blur-xl border border-border/20 rounded-3xl p-8 shadow-2xl">
              {/* Logo and branding */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-netcore-blue to-netcore-orange rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Welcome to Netcore Cloud!
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Let's set up your WhatsApp Business sender so you can start sending messages.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-whatsapp-green-light/50">
                  <div className="w-8 h-8 mx-auto mb-2 bg-whatsapp-green rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-whatsapp-green">Secure</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-netcore-blue-light/50">
                  <div className="w-8 h-8 mx-auto mb-2 bg-netcore-blue rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-netcore-blue">Fast Setup</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-netcore-orange-light/50">
                  <div className="w-8 h-8 mx-auto mb-2 bg-netcore-orange rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-netcore-orange">Reliable</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={openRegisterModal}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-netcore-blue to-netcore-orange hover:from-netcore-blue/90 hover:to-netcore-orange/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get started</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={downloadLogs}
                  className="w-full h-12 text-base font-medium border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-200"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>Download logs</span>
                  </span>
                </Button>
              </div>

              {/* Footer note */}
              <div className="text-center mt-6 pt-6 border-t border-border/20">
                <p className="text-sm text-muted-foreground">
                  Powered by Meta's WhatsApp Business API
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Components */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="custom-modal-animate" style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 10
              }}
            >
              ×
            </button>

            {/* Modal Step 2: Choose option */}
            {modalStep === 2 && (
              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', color: '#333' }}>
                  WhatsApp Business Setup
                </h2>
                <p style={{ color: '#666', marginBottom: '32px', textAlign: 'center', lineHeight: '1.5' }}>
                  Choose how you'd like to set up your WhatsApp Business account
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={handleConnectOutsideInfobip}
                    style={{
                      padding: '20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = '#3b82f6';
                      target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = '#e5e7eb';
                      target.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                      Connect Existing Number
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                      I have a WhatsApp Business number and want to connect it
                    </p>
                  </button>

                  <button
                    onClick={handleMigrateNumber}
                    style={{
                      padding: '20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = '#3b82f6';
                      target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = '#e5e7eb';
                      target.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                      Migrate Number to Business API
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                      I want to migrate my number from WhatsApp Business App
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Step 3: Migration */}
            {modalStep === 3 && (
              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', color: '#333' }}>
                  Migrate Your Number
                </h2>
                <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                  Please confirm you've completed these steps before proceeding
                </p>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={migrationChecks.doc}
                      onChange={(e) => setMigrationChecks(prev => ({ ...prev, doc: e.target.checked }))}
                      style={{ marginTop: '2px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ color: '#333', lineHeight: '1.5' }}>
                      I have read and understood the <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline' }}>migration documentation</a>
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={migrationChecks.twofa}
                      onChange={(e) => setMigrationChecks(prev => ({ ...prev, twofa: e.target.checked }))}
                      style={{ marginTop: '2px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ color: '#333', lineHeight: '1.5' }}>
                      I have disabled 2FA (two-factor authentication) on my WhatsApp Business App
                    </span>
                  </label>
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outline"
                    onClick={() => setModalStep(2)}
                    style={{ padding: '12px 24px' }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleMigrationLogin}
                    disabled={!migrationChecks.doc || !migrationChecks.twofa || buttonLoading}
                    style={{
                      padding: '12px 24px',
                      background: (!migrationChecks.doc || !migrationChecks.twofa || buttonLoading) ? '#e5e7eb' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (!migrationChecks.doc || !migrationChecks.twofa || buttonLoading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {buttonLoading ? 'Processing...' : 'Continue with Facebook'}
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Step 4: Connect */}
            {modalStep === 4 && (
              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', color: '#333' }}>
                  Connect Your Number
                </h2>
                <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                  We'll connect your existing WhatsApp Business number to Netcore Cloud
                </p>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={connectChecks.confirm}
                      onChange={(e) => setConnectChecks(prev => ({ ...prev, confirm: e.target.checked }))}
                      style={{ marginTop: '2px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ color: '#333', lineHeight: '1.5' }}>
                      I confirm that I want to connect my WhatsApp Business number to Netcore Cloud
                    </span>
                  </label>
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outline"
                    onClick={() => setModalStep(2)}
                    style={{ padding: '12px 24px' }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConnectLogin}
                    disabled={!connectChecks.confirm || buttonLoading}
                    style={{
                      padding: '12px 24px',
                      background: (!connectChecks.confirm || buttonLoading) ? '#e5e7eb' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (!connectChecks.confirm || buttonLoading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {buttonLoading ? 'Processing...' : 'Continue with Facebook'}
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Step 5: Loading */}
            {modalStep === 5 && (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                </div>
                
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
                  Setting up your WhatsApp Business
                </h2>
                
                <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: loadingStep >= 0 ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {loadingStep >= 0 && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span style={{ color: loadingStep >= 0 ? '#333' : '#999' }}>Connecting to Facebook</span>
                  </div>
                  
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: loadingStep >= 1 ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {loadingStep >= 1 && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span style={{ color: loadingStep >= 1 ? '#333' : '#999' }}>Validating business account</span>
                  </div>
                  
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: loadingStep >= 2 ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {loadingStep >= 2 && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span style={{ color: loadingStep >= 2 ? '#333' : '#999' }}>Configuring WhatsApp API</span>
                  </div>
                  
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: loadingStep >= 3 ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {loadingStep >= 3 && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span style={{ color: loadingStep >= 3 ? '#333' : '#999' }}>Setting up Netcore integration</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: loadingStep >= 4 ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {loadingStep >= 4 && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span style={{ color: loadingStep >= 4 ? '#333' : '#999' }}>Finalizing setup</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Step 6: Success */}
            {modalStep === 6 && (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <span style={{ color: 'white', fontSize: '32px' }}>✓</span>
                  </div>
                </div>
                
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
                  Success! 🎉
                </h2>
                
                <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.5', textAlign: 'left' }}>
                  Your WhatsApp Business sender has been successfully set up with Netcore Cloud. You can now start sending messages to your customers.
                </p>
                
                {/* Test message section */}
                <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                    Send a test message (optional)
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Recipient phone number (with country code)
                    </label>
                    <input
                      type="text"
                      value={testMessage.recipient}
                      onChange={(e) => setTestMessage(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="+1234567890"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Message
                    </label>
                    <textarea
                      value={testMessage.body}
                      onChange={(e) => setTestMessage(prev => ({ ...prev, body: e.target.value }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendTestMessage}
                    disabled={sendingTest || !testMessage.recipient || !testMessage.body}
                    style={{
                      padding: '12px 24px',
                      background: (sendingTest || !testMessage.recipient || !testMessage.body) ? '#e5e7eb' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (sendingTest || !testMessage.recipient || !testMessage.body) ? 'not-allowed' : 'pointer',
                      width: '100%'
                    }}
                  >
                    {sendingTest ? 'Sending...' : 'Send Test Message'}
                  </Button>
                </div>
                
                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 24px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Step 7: Error */}
            {modalStep === 7 && (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <span style={{ color: 'white', fontSize: '32px' }}>✕</span>
                  </div>
                </div>
                
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
                  Setup Incomplete
                </h2>
                
                <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.5' }}>
                  The WhatsApp Business setup was cancelled or encountered an error. Please try again or contact support if the issue persists.
                </p>
                
                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '12px 24px' }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleTryAgain}
                    style={{
                      padding: '12px 24px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snackbar */}
      {showSnackbar && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1100
        }}>
          {snackbarMessage}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .custom-modal-animate {
          animation: modalEnter 0.3s ease-out;
        }
        
        @keyframes modalEnter {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>;
};

export default Index;
