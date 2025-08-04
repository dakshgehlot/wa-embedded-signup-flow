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
      {/* SVG Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{transform: 'scale(1.5)'}}>
          <rect width="1440" height="900" fill="#F4F8FF" />
          <path d="M1059.19 402.468C1061.36 401.979 1071.57 401.943 1226.63 402.048L1229.25 402.853C1230.68 403.307 1233.13 404.32 1234.67 405.124C1236.8 406.243 1238.27 407.397 1240.79 409.913C1243.3 412.43 1244.46 413.899 1245.57 416.031C1246.38 417.569 1247.36 420.016 1247.74 421.45C1248.16 422.918 1248.62 426.098 1248.79 428.615C1249 431.096 1249.31 433.964 1249.52 434.908C1249.77 435.887 1250.64 438.089 1251.48 439.801C1252.32 441.514 1253.82 443.961 1254.84 445.184C1255.85 446.407 1257.63 448.12 1258.79 448.959C1259.94 449.833 1262 451.057 1263.33 451.721C1264.66 452.385 1266.65 453.189 1267.7 453.503C1269.41 454.028 1273.12 454.133 1300.56 454.308C1328.52 454.518 1331.71 454.588 1333.59 455.147C1334.75 455.461 1337.19 456.475 1339.01 457.349C1341.88 458.747 1342.79 459.447 1345.65 462.313C1348.17 464.864 1349.32 466.367 1350.44 468.464C1351.25 470.002 1352.26 472.45 1352.68 473.883C1353.48 476.503 1353.48 476.575 1353.69 507.384V507.441C1353.87 534.776 1353.97 538.586 1354.5 540.299C1354.81 541.348 1355.69 543.48 1356.49 545.018C1357.26 546.556 1358.73 548.828 1359.71 550.051C1360.72 551.275 1362.5 552.988 1363.66 553.862C1364.81 554.736 1367.01 556.029 1368.55 556.728C1370.09 557.462 1372.15 558.231 1373.09 558.441C1374.07 558.685 1376.8 559 1379.21 559.175C1381.62 559.35 1384.59 559.735 1385.85 560.049C1387.11 560.364 1389.63 561.342 1391.45 562.216C1394.31 563.614 1395.22 564.314 1398.09 567.18C1400.6 569.732 1401.76 571.235 1402.88 573.332C1403.68 574.87 1404.69 577.387 1405.95 581.721V690.958C1405.95 795.091 1405.92 800.3 1405.32 802.467C1404.97 803.726 1403.96 806.242 1403.08 808.06C1401.69 810.891 1400.95 811.87 1398.12 814.737C1395.26 817.568 1394.28 818.302 1391.45 819.701C1389.63 820.574 1387.11 821.553 1385.85 821.868C1384.59 822.182 1381.62 822.567 1379.21 822.742C1376.8 822.916 1374.07 823.231 1373.09 823.441C1372.15 823.685 1369.91 824.559 1368.2 825.363C1366.49 826.202 1364.04 827.741 1362.82 828.754C1361.59 829.768 1359.88 831.55 1359.04 832.703C1358.17 833.857 1356.87 836.06 1356.14 837.598C1355.41 839.136 1354.64 841.163 1354.39 842.142C1354.18 843.086 1353.87 845.917 1353.69 848.434C1353.52 851.056 1353.06 854.097 1352.64 855.6C1352.23 857.033 1351.25 859.48 1350.44 861.018C1349.32 863.15 1348.17 864.618 1345.65 867.135C1343.14 869.652 1341.67 870.806 1339.54 871.924C1338 872.728 1335.48 873.742 1331.15 875H1112.67L1109.88 874.197C1108.34 873.742 1105.82 872.728 1104.28 871.924C1102.19 870.806 1100.68 869.652 1098.13 867.135C1095.26 864.269 1094.57 863.36 1093.17 860.494C1092.29 858.676 1091.31 856.159 1091 854.901C1090.65 853.642 1090.27 850.671 1090.13 848.259C1089.95 845.847 1089.64 843.086 1089.43 842.142C1089.18 841.163 1088.41 839.136 1087.68 837.598C1086.95 836.06 1085.65 833.857 1084.78 832.703C1083.94 831.55 1082.23 829.768 1081 828.754C1079.78 827.741 1077.51 826.272 1075.97 825.503C1074.43 824.734 1072.3 823.86 1071.25 823.545C1069.54 823.021 1065.83 822.916 1038.39 822.742H1038.37C1007.49 822.532 1007.45 822.532 1004.83 821.728C1003.4 821.308 1000.95 820.295 999.416 819.491C997.284 818.372 995.816 817.218 993.299 814.702C990.782 812.185 989.628 810.717 988.51 808.584C987.706 807.046 986.727 804.6 986.308 803.166C985.888 801.663 985.434 798.622 985.259 796C985.084 793.484 984.769 790.652 984.524 789.708C984.315 788.73 983.546 786.702 982.812 785.164C982.112 783.626 980.819 781.423 979.945 780.27C979.071 779.116 977.359 777.334 976.136 776.321C974.912 775.307 972.5 773.768 970.752 772.929C969.004 772.125 966.837 771.252 965.858 771.007C964.915 770.797 962.153 770.483 959.741 770.308C957.329 770.168 954.358 769.784 953.1 769.434C951.841 769.119 949.325 768.141 947.507 767.267C944.641 765.869 943.731 765.169 940.865 762.303C938.348 759.751 937.195 758.248 936.076 756.151C935.272 754.613 934.258 752.096 933 747.761V529.287L933.804 526.492C934.258 524.954 935.272 522.436 936.076 520.898C937.195 518.801 938.349 517.298 940.865 514.746C943.732 511.88 944.64 511.181 947.507 509.783C949.324 508.909 951.841 507.93 953.1 507.616C954.358 507.266 957.329 506.881 959.741 506.742C962.153 506.567 964.915 506.252 965.858 506.042C966.837 505.798 968.864 505.028 970.402 504.294C971.94 503.56 974.143 502.267 975.297 501.393C976.45 500.554 978.232 498.841 979.246 497.618C980.26 496.394 981.764 493.983 982.603 492.235C983.441 490.487 984.315 488.285 984.56 487.341C984.769 486.397 985.084 483.531 985.294 481.049C985.469 478.533 985.923 475.351 986.343 473.883C986.727 472.45 987.706 470.002 988.51 468.464C989.628 466.367 990.782 464.864 993.299 462.313C996.165 459.446 997.074 458.747 999.94 457.349C1001.76 456.475 1004.27 455.496 1005.53 455.181C1006.79 454.866 1009.76 454.483 1012.17 454.308C1014.59 454.133 1017.35 453.818 1018.29 453.609C1019.27 453.364 1021.3 452.595 1022.84 451.861C1024.37 451.127 1026.58 449.833 1027.73 448.959C1028.88 448.12 1030.67 446.407 1031.68 445.184C1032.69 443.961 1034.2 441.514 1035.04 439.801C1035.87 438.089 1036.75 435.887 1036.99 434.908C1037.2 433.964 1037.52 431.096 1037.73 428.615C1037.9 426.098 1038.36 422.918 1038.78 421.45C1039.16 420.016 1040.14 417.569 1040.94 416.031C1042.03 413.968 1043.25 412.395 1045.56 410.053C1047.65 407.921 1049.51 406.418 1051.15 405.509C1052.48 404.775 1054.3 403.901 1055.17 403.586C1056.04 403.237 1057.86 402.748 1059.19 402.468ZM1144.31 455.845C1099.04 455.81 1061.67 455.845 1061.29 455.915C1060.9 455.985 1059.72 456.23 1058.67 456.44C1057.62 456.65 1055.35 457.489 1053.6 458.328C1051.85 459.166 1049.44 460.704 1048.21 461.718C1046.99 462.732 1045.28 464.515 1044.44 465.668C1043.57 466.822 1042.27 469.024 1041.54 470.562C1040.8 472.1 1040.03 474.162 1039.79 475.106C1039.58 476.085 1039.27 478.811 1039.09 481.223C1038.95 483.635 1038.57 486.606 1038.22 487.865C1037.9 489.123 1036.92 491.641 1036.05 493.458C1034.65 496.324 1033.95 497.234 1031.09 500.1C1028.54 502.617 1027.03 503.77 1024.93 504.888C1023.4 505.692 1020.95 506.672 1019.52 507.056C1018.05 507.475 1014.87 507.93 1012.35 508.105C1009.83 508.315 1007 508.629 1006.06 508.838C1005.08 509.083 1002.91 509.957 1001.16 510.796C999.416 511.635 997.005 513.138 995.781 514.152C994.558 515.165 992.845 516.948 991.971 518.102C991.097 519.255 989.804 521.458 989.104 522.995C988.371 524.533 987.567 526.665 987.322 527.714C986.903 529.322 986.832 547.605 986.832 638.525C986.832 728.256 986.903 747.761 987.287 749.334C987.567 750.383 988.476 752.655 989.314 754.403C990.153 756.151 991.656 758.563 992.67 759.786C993.684 761.01 995.467 762.722 996.62 763.596C997.774 764.47 999.836 765.694 1001.16 766.358C1002.49 766.987 1004.49 767.791 1005.53 768.106C1007.32 768.665 1012.04 768.735 1064.61 768.91L1121.76 769.084C1125.82 770.343 1128.26 771.357 1129.8 772.161C1131.93 773.279 1133.4 774.433 1135.92 776.95C1138.44 779.466 1139.59 780.935 1140.71 783.067C1141.51 784.605 1142.49 787.052 1142.91 788.485C1143.33 789.988 1143.78 793.029 1143.96 795.651C1144.13 798.168 1144.45 800.999 1144.66 801.943C1144.9 802.922 1145.78 805.089 1146.58 806.836C1147.42 808.584 1148.96 810.997 1149.97 812.22C1150.98 813.443 1152.77 815.156 1153.92 816.03C1155.07 816.903 1157.28 818.197 1158.81 818.896C1160.35 819.63 1162.49 820.434 1163.53 820.679C1165.11 821.098 1175.32 821.168 1221.91 821.168C1268.16 821.168 1278.71 821.099 1280.29 820.679C1281.33 820.434 1283.47 819.63 1285 818.896C1286.54 818.162 1288.75 816.868 1289.9 815.995C1291.05 815.156 1292.83 813.443 1293.85 812.22C1294.86 810.997 1296.37 808.584 1297.21 806.836C1298.04 805.089 1298.92 802.921 1299.16 801.943C1299.37 800.999 1299.69 798.168 1299.86 795.651C1300.04 793.029 1300.49 789.988 1300.91 788.485C1301.33 787.052 1302.31 784.605 1303.11 783.067C1304.23 780.934 1305.38 779.466 1307.9 776.95C1310.42 774.433 1311.89 773.279 1314.02 772.161C1315.56 771.357 1318 770.378 1319.44 769.994C1320.9 769.574 1324.09 769.119 1326.6 768.945C1329.12 768.735 1331.92 768.42 1332.89 768.175C1333.84 767.965 1335.9 767.196 1337.44 766.462C1338.98 765.763 1341.18 764.47 1342.33 763.596C1343.49 762.722 1345.27 761.01 1346.28 759.786C1347.3 758.563 1348.8 756.151 1349.64 754.403C1350.48 752.655 1351.39 750.383 1351.67 749.334C1352.05 747.761 1352.12 732.591 1352.12 664.742C1352.12 596.444 1352.05 581.724 1351.63 580.149C1351.39 579.1 1350.58 576.967 1349.85 575.429C1349.11 573.891 1347.82 571.689 1346.95 570.536C1346.11 569.382 1344.4 567.599 1343.17 566.585C1341.95 565.572 1339.5 564.069 1337.79 563.23C1336.08 562.391 1333.84 561.517 1332.89 561.272C1331.92 561.062 1329.12 560.748 1326.6 560.538C1324.09 560.364 1320.9 559.909 1319.44 559.49C1318 559.105 1315.56 558.127 1314.02 557.323C1311.89 556.204 1310.42 555.05 1307.9 552.534C1305.38 550.017 1304.23 548.549 1303.11 546.416C1302.31 544.878 1301.33 542.431 1300.95 540.997C1300.53 539.529 1300.07 536.349 1299.9 533.832C1299.69 531.351 1299.37 528.518 1299.16 527.539C1298.92 526.595 1298.15 524.533 1297.41 522.995C1296.68 521.458 1295.39 519.255 1294.51 518.102C1293.67 516.948 1291.96 515.165 1290.74 514.152C1289.51 513.138 1287.07 511.635 1285.35 510.796C1283.64 509.957 1281.4 509.083 1280.46 508.838C1279.48 508.629 1276.76 508.314 1274.34 508.139C1271.93 507.999 1268.96 507.616 1267.7 507.266C1266.44 506.951 1263.93 505.972 1262.11 505.098C1259.28 503.7 1258.3 502.966 1255.43 500.134C1252.6 497.268 1251.87 496.29 1250.47 493.458C1249.59 491.641 1248.62 489.123 1248.3 487.865C1247.99 486.606 1247.6 483.635 1247.43 481.223C1247.25 478.811 1246.94 476.085 1246.73 475.106C1246.48 474.162 1245.71 472.1 1244.98 470.562C1244.25 469.024 1242.95 466.822 1242.08 465.668C1241.24 464.515 1239.53 462.732 1238.3 461.718C1237.08 460.739 1234.81 459.271 1233.27 458.502C1231.73 457.698 1229.6 456.825 1228.55 456.475C1226.77 455.951 1220.55 455.88 1144.31 455.845Z" fill="#F1F1F1" />
          <path d="M292.975 33.2664C294.115 33.0654 351.179 32.9448 544.67 33.0252L547.686 33.95C549.334 34.4727 552.148 35.6386 553.917 36.5633C556.37 37.8498 558.058 39.1764 560.953 42.0711C563.848 44.966 565.175 46.6556 566.462 49.1082C567.387 50.8773 568.553 53.7723 570 58.7576V249.74L569.075 252.957C568.552 254.726 567.387 257.621 566.462 259.39C565.175 261.843 563.848 263.532 560.953 266.427C558.058 269.321 556.37 270.648 553.917 271.934C552.148 272.859 549.334 274.025 547.686 274.508C544.671 275.432 544.629 275.433 509.12 275.674H509.087C477.605 275.875 473.262 275.995 471.292 276.598C470.086 276.96 467.633 277.966 465.864 278.89C464.095 279.775 461.481 281.464 460.074 282.59C458.667 283.756 456.696 285.806 455.731 287.133C454.726 288.459 453.239 290.992 452.395 292.762C451.55 294.531 450.666 296.903 450.385 297.989C450.144 299.115 449.781 302.372 449.58 305.226C449.379 308.242 448.856 311.74 448.374 313.469C447.892 315.117 446.766 317.932 445.841 319.701C444.554 322.153 443.228 323.842 440.333 326.737C437.438 329.632 435.749 330.958 433.297 332.245C431.528 333.17 428.713 334.296 427.064 334.738C425.376 335.221 421.717 335.743 418.822 335.944C415.928 336.185 412.671 336.548 411.585 336.789C410.459 337.07 407.966 338.075 405.956 339C403.946 339.965 401.171 341.734 399.764 342.9C398.357 344.066 396.387 346.116 395.422 347.443C394.417 348.77 392.928 351.303 392.084 353.072C391.24 354.841 390.356 357.214 390.074 358.3C389.833 359.426 389.471 362.682 389.27 365.537C389.068 368.552 388.546 372.05 388.063 373.779C387.581 375.428 386.455 378.241 385.53 380.011C384.244 382.423 382.917 384.153 380.022 387.088C376.726 390.385 375.68 391.188 372.383 392.797C370.292 393.802 367.398 394.928 365.95 395.29C364.503 395.692 361.085 396.134 358.311 396.295C355.536 396.496 352.36 396.858 351.274 397.099C350.189 397.381 347.656 398.385 345.646 399.35C343.635 400.315 340.86 402.045 339.453 403.211C338.046 404.377 336.076 406.427 335.111 407.754C334.106 409.08 332.699 411.452 331.935 412.98C331.171 414.508 330.246 416.8 329.884 418.007C329.281 419.977 329.2 424.24 328.959 455.802V455.865C328.718 491.304 328.717 491.387 327.793 494.4C327.31 496.049 326.144 498.863 325.22 500.632C323.933 503.084 322.607 504.773 319.712 507.668C316.817 510.563 315.128 511.89 312.676 513.177C310.907 514.101 308.092 515.227 306.443 515.71C304.755 516.152 301.096 516.715 298.08 516.916C295.186 517.157 291.93 517.518 290.884 517.76C289.798 518.001 287.345 519.007 285.335 519.971C283.325 520.936 280.55 522.665 279.143 523.831C277.735 524.997 275.766 527.048 274.801 528.375C273.796 529.702 272.308 532.235 271.464 534.004C270.62 535.773 269.735 538.145 269.453 539.23C269.212 540.356 268.85 543.492 268.649 546.266C268.489 549.041 268.046 552.459 267.644 553.906C267.282 555.354 266.157 558.249 265.151 560.34C263.543 563.596 262.698 564.721 259.441 568.018C256.144 571.275 255.018 572.12 251.762 573.728C249.671 574.733 246.777 575.9 245.329 576.302C242.876 576.985 239.097 577.025 177.379 577.025C115.664 577.025 111.882 576.985 109.43 576.302C107.982 575.9 105.087 574.733 102.996 573.728C99.7394 572.12 98.6134 571.275 95.3164 568.018C92.0601 564.722 91.2155 563.596 89.6074 560.34C88.6022 558.249 87.4761 555.353 87.1143 553.906C86.7122 552.459 86.2702 549.041 86.1094 546.266C85.9083 543.492 85.5469 540.356 85.3057 539.23C85.0242 538.145 84.1392 535.773 83.2949 534.004C82.4506 532.235 80.9632 529.702 79.958 528.375C78.993 527.048 77.0225 524.997 75.6152 523.831C74.208 522.665 71.434 520.936 69.4238 519.971C67.4137 519.007 64.9209 518.001 63.7949 517.72C62.7094 517.478 59.4524 517.117 56.5576 516.876C53.6627 516.675 50.0031 516.152 48.3145 515.67C46.666 515.227 43.852 514.101 42.083 513.177C39.6304 511.89 37.9418 510.563 35.0469 507.668C32.152 504.773 30.8247 503.084 29.5381 500.632C28.6133 498.863 27.4474 495.968 26 490.982V365.336C26 245.559 26.0401 239.568 26.7236 237.075C27.1257 235.628 28.2918 232.733 29.2969 230.642C30.9052 227.345 31.7099 226.3 35.0068 223.003C37.9418 220.108 39.6707 218.781 42.083 217.495C43.852 216.57 46.6659 215.444 48.3145 215.002C50.0031 214.519 53.6627 213.997 56.5576 213.796C59.4524 213.554 62.7094 213.192 63.7949 212.951C64.9208 212.669 67.2526 211.785 69.0215 210.941C70.7906 210.097 73.3236 208.608 74.6504 207.603C75.9771 206.638 78.0273 204.669 79.1934 203.262C80.3594 201.854 82.0887 199.079 83.0537 197.069C84.0186 195.059 85.0242 192.566 85.3057 191.44C85.5469 190.354 85.9082 187.057 86.1494 184.203C86.3505 181.308 86.873 177.649 87.3555 175.961C87.7977 174.312 88.9239 171.497 89.8486 169.728C91.1352 167.316 92.4626 165.587 95.3574 162.652C98.6541 159.355 99.6994 158.551 102.996 156.943C105.087 155.938 107.982 154.812 109.43 154.45C110.877 154.048 114.294 153.606 117.068 153.445C119.842 153.244 123.019 152.882 124.104 152.64C125.23 152.359 127.563 151.475 129.332 150.631C131.101 149.786 133.634 148.298 134.961 147.293C136.288 146.328 138.338 144.358 139.504 142.951C140.67 141.544 142.319 138.93 143.203 137.161C144.088 135.392 145.093 132.939 145.415 131.733C145.737 130.527 146.179 127.069 146.42 124.094C146.621 121.078 147.184 117.339 147.666 115.65C148.108 114.002 149.234 111.187 150.159 109.418C151.446 106.965 152.772 105.276 155.667 102.382C158.562 99.4867 160.251 98.1604 162.704 96.8738C164.473 95.9491 167.287 94.7831 168.936 94.3006C171.95 93.3761 171.992 93.3756 207.502 93.1346H207.534C239.137 92.9335 243.359 92.8129 245.329 92.2098C246.535 91.8479 248.827 90.9229 250.354 90.159C251.882 89.395 254.255 87.9884 255.582 86.9832C256.909 86.0182 258.959 84.0477 260.125 82.6404C261.291 81.2332 263.02 78.4182 263.985 76.448C264.95 74.478 265.955 71.9448 266.236 70.8191C266.478 69.7332 266.84 66.4764 267.041 63.5818C267.242 60.5664 267.765 57.0684 268.247 55.3396C268.73 53.6912 269.856 50.8772 270.78 49.1082C272.027 46.736 273.433 44.926 276.087 42.2322C278.58 39.6992 280.631 38.0506 282.722 36.8846C284.37 35.9598 286.903 34.8747 288.351 34.4324C289.798 33.9499 291.889 33.4272 292.975 33.2664ZM389.672 94.9031C335.835 94.8629 294.06 94.9833 292.854 95.1844C291.728 95.3854 289.717 95.9081 288.431 96.3504C287.184 96.7927 285.053 97.7986 283.727 98.5223C282.4 99.2862 280.269 100.774 278.942 101.859C277.656 102.905 275.766 104.875 274.801 106.202C273.796 107.529 272.308 110.062 271.464 111.831C270.62 113.6 269.735 115.972 269.453 117.057C269.212 118.183 268.85 121.319 268.649 124.094C268.489 126.868 268.046 130.286 267.644 131.733C267.282 133.181 266.156 136.075 265.151 138.166C263.543 141.463 262.738 142.508 259.441 145.805C256.506 148.7 254.778 150.027 252.365 151.313C250.596 152.238 247.781 153.404 246.133 153.887C243.119 154.811 243.076 154.812 207.567 155.053H207.534C175.732 155.294 171.71 155.374 169.74 155.977C168.534 156.339 166.082 157.385 164.312 158.269C162.543 159.154 159.93 160.803 158.522 161.969C157.115 163.134 155.145 165.185 154.18 166.512C153.175 167.838 151.687 170.372 150.843 172.141C149.998 173.91 149.113 176.282 148.832 177.368C148.591 178.494 148.23 181.751 147.988 184.605C147.787 187.5 147.265 191.159 146.782 192.847C146.34 194.496 145.214 197.311 144.289 199.08C143.002 201.492 141.675 203.221 138.78 206.156C135.484 209.453 134.438 210.257 131.142 211.865C129.051 212.87 126.155 213.996 124.708 214.358C123.26 214.76 119.843 215.202 117.069 215.363C114.295 215.564 111.119 215.927 110.033 216.168C108.907 216.449 106.414 217.454 104.403 218.419C102.393 219.384 99.6191 221.113 98.2119 222.279C96.8047 223.445 94.8341 225.495 93.8691 226.822C92.864 228.149 91.3766 230.682 90.5322 232.451C89.7281 234.22 88.7629 236.673 88.4814 237.88C87.9991 239.731 87.9189 255.738 87.9189 335.18C87.9189 413.222 87.9991 430.672 88.4414 432.481C88.7631 433.688 89.8085 436.301 90.7734 438.311C91.7384 440.322 93.4678 443.096 94.6338 444.503C95.7998 445.91 97.85 447.881 99.1768 448.845C100.504 449.851 103.037 451.338 104.806 452.182C106.575 453.027 108.907 453.912 110.033 454.193C111.119 454.434 114.295 454.796 117.069 454.997C119.843 455.158 123.26 455.6 124.708 456.002C126.155 456.364 129.051 457.49 131.142 458.495C134.438 460.103 135.484 460.907 138.78 464.204C141.675 467.139 143.002 468.869 144.289 471.281C145.214 473.05 146.34 475.864 146.822 477.512C147.265 479.201 147.827 482.86 148.028 485.876C148.27 488.771 148.632 492.028 148.873 493.113C149.114 494.158 150.119 496.611 151.084 498.621C152.049 500.631 153.778 503.406 154.944 504.813C156.11 506.22 158.161 508.191 159.487 509.196C160.814 510.201 163.347 511.689 165.116 512.493C166.885 513.337 169.338 514.262 170.544 514.544C172.313 514.986 179.47 515.106 207.534 515.106C235.398 515.106 242.756 514.986 244.525 514.544C245.732 514.262 248.184 513.337 249.953 512.493C251.722 511.649 254.255 510.161 255.582 509.156C256.909 508.191 258.959 506.22 260.125 504.813C261.251 503.406 262.94 500.792 263.824 499.023C264.749 497.254 265.754 494.802 266.116 493.595C266.719 491.625 266.84 487.283 267.041 455.801C267.282 423.595 267.363 419.977 268.006 417.805C268.368 416.479 269.534 413.664 270.539 411.573C272.147 408.276 272.951 407.231 276.248 403.934C279.183 401.039 280.913 399.712 283.325 398.426C285.094 397.501 287.908 396.375 289.557 395.932C291.245 395.45 294.904 394.927 297.799 394.726C300.693 394.485 303.91 394.124 305.036 393.883C306.122 393.601 308.495 392.716 310.264 391.872C312.033 391.027 314.566 389.54 315.893 388.535C317.219 387.57 319.27 385.599 320.436 384.192C321.602 382.785 323.29 380.171 324.175 378.402C325.059 376.633 326.065 374.181 326.427 372.974C327.03 371.004 327.151 366.741 327.352 335.18C327.593 302.975 327.673 299.356 328.316 297.184C328.678 295.857 329.845 293.044 330.85 290.953C332.458 287.696 333.302 286.57 336.559 283.273C339.856 280.016 340.982 279.172 344.238 277.563C346.329 276.558 349.223 275.433 350.671 275.071C352.118 274.709 355.536 274.266 358.311 274.065C361.085 273.864 364.221 273.503 365.347 273.221C366.432 272.98 368.805 272.095 370.574 271.251C372.343 270.447 374.876 268.959 376.203 267.954C377.53 266.949 379.58 264.978 380.746 263.571C381.912 262.164 383.642 259.39 384.606 257.38C385.571 255.369 386.576 252.877 386.857 251.751C387.099 250.665 387.461 247.368 387.662 244.513C387.863 241.498 388.386 238 388.868 236.271C389.351 234.623 390.477 231.808 391.401 230.039C392.688 227.586 394.014 225.897 396.909 223.003C399.804 220.108 401.493 218.781 403.945 217.494C405.714 216.569 408.529 215.403 410.178 214.921C413.192 213.996 413.234 213.997 448.744 213.756L448.776 213.755C480.379 213.554 484.601 213.434 486.571 212.831C487.778 212.469 490.069 211.544 491.597 210.78C493.124 210.016 495.496 208.608 496.823 207.603C498.15 206.638 500.201 204.669 501.367 203.262C502.533 201.854 504.262 199.079 505.227 197.069C506.192 195.059 507.237 192.445 507.559 191.239C507.961 189.47 508.082 181.911 508.082 154.249C508.082 126.386 507.961 119.028 507.519 117.259C507.237 116.052 506.312 113.6 505.468 111.831C504.623 110.062 503.136 107.529 502.131 106.202C501.166 104.875 499.196 102.824 497.789 101.658C496.382 100.492 493.768 98.8033 491.999 97.9187C490.23 97.0343 487.778 96.0289 486.571 95.6267C484.521 95.0236 477.564 94.9433 389.672 94.9031Z" fill="#E9F1ED" />
        </svg>
      </div>

      {/* Header with Netcore logo */}
      <header className="relative w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
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
          text-align: center;
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
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .migration-warning-icon {
          color: #ffb300;
          font-size: 22px;
          margin-top: 2px;
        }
        .migration-section {
          margin-bottom: 24px;
        }
        .migration-section-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .migration-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .migration-icon-success {
          background-color: rgba(46, 125, 50, 0.15);
          color: #2e7d32;
        }
        .migration-icon-error {
          background-color: rgba(211, 47, 47, 0.15);
          color: #d32f2f;
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
          margin: 0 0 0 30px;
          padding: 0;
          color: #444;
          font-size: 15px;
          line-height: 1.6;
          list-style-type: disc;
        }
        .migration-list li {
          margin-bottom: 4px;
        }
        .migration-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 15px;
          line-height: 1.5;
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
      <div className="flex justify-center items-center min-h-screen px-6">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">
            👋 Welcome to Netcore Cloud!
          </h1>
          <p className="text-gray-600 mb-6">
            Let's set up your WhatsApp Business sender so you can start sending messages.
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={downloadLogs} variant="default" className="w-full py-3 bg-neutral-50 text-[#143f93]">
              Download logs
            </Button>
            <button onClick={openRegisterModal} className="w-full bg-[#143F93] text-white rounded-lg font-medium hover:bg-[#0f3578] transition-colors py-3">
              Get started
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center" style={{
      background: '#F4F8FF'
    }}>
        <div className="w-full max-w-md px-6">
          <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] p-8 text-center px-0 py-0">
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
              borderRadius: 12,
              padding: '40px',
              minWidth: 520,
              maxWidth: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
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
                        <Link size={28} color="#ff6d00" style={{
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                        <div className="option-content">
                          <div className="option-title">Connect a number you have outside of Netcore Cloud</div>
                          <div className="option-desc">You will need to delete any existing WhatsApp accounts connected to the number. Verification with SMS or phone call required.</div>
                        </div>
                      </div>
                      <div className="option-card" onClick={handleMigrateNumber}>
                        <ArrowRightLeft size={28} color="#ff6d00" style={{
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
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
                        <div className="migration-section-title"><span className="migration-icon migration-icon-success">✓</span> Will be migrated:</div>
                        <ul className="migration-list">
                          <li>Display name, sender quality rating, and messaging limits</li>
                          <li>Official Business Account status</li>
                          <li>High quality templates</li>
                          <li>Messages and chat history (only for cloud senders on Meta servers)</li>
                        </ul>
                      </div>
                      <div className="migration-section">
                        <div className="migration-section-title"><span className="migration-icon migration-icon-error">✕</span> Will not be migrated:</div>
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
                      <div className="modal-title">Completing registration with Meta...</div>
                      <div style={{
                  textAlign: 'center',
                  padding: '40px 0'
                }}>
                        <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #143F93',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }} className="mx-0 my-[5px]"></div>
                        <div style={{
                    color: '#666',
                    fontSize: '16px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                          {loadingStep === 0 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}>✓</span>
                              Getting your business token...
                            </div>}
                          {loadingStep === 1 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}>✓</span>
                              Subscribing to webhooks
                            </div>}
                          {loadingStep === 2 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}>✓</span>
                              Extending credit line
                            </div>}
                          {loadingStep === 3 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}>✓</span>
                              Registering the phone number
                            </div>}
                          {loadingStep === 4 && <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}>
                              <span style={{
                        marginRight: '8px',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}>✓</span>
                              Finalizing registration...
                            </div>}
                        </div>
                      </div>
                    </>}
                  {/* Step 6: Success state */}
                  {modalStep === 6 && <>
                      <div className="modal-title" style={{
                  color: '#000000',
                  textAlign: 'center'
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
                    fontSize: '60px',
                    color: 'white',
                    animation: 'bounce 1s ease-in-out'
                  }}>✓</div>
                        <p style={{
                    color: '#666',
                    fontSize: '16px'
                  }}>Your WhatsApp sender has been successfully registered with Meta and Netcore Cloud.</p>
                      </div>
                      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
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
                  color: '#000000',
                  textAlign: 'center'
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