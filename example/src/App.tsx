import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CookiesManager from '../../src';

export default function App() {
  const [cookies, setCookies] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  const testSetCookie = async () => {
    try {
      addLog('🍪 Setting test cookie...');
      const result = await CookiesManager.setCookie(
        'https://httpbin.org',
        'test_cookie',
        'test_value_123',
        'httpbin.org', // domain
        '/', // path
        Date.now() + 86400000, // expires (24 horas desde ahora)
        false, // secure
        false // httpOnly
      );
      addLog(`✅ Set cookie result: ${result}`);
    } catch (error: any) {
      addLog(`❌ Set cookie error: ${error.message}`);
    }
  };

  const testSetSecureCookie = async () => {
    try {
      addLog('🔒 Setting secure cookie...');
      const result = await CookiesManager.setCookie(
        'https://httpbin.org',
        'secure_cookie',
        'secure_value_456',
        'httpbin.org',
        '/',
        Date.now() + 86400000,
        true, // secure
        true // httpOnly
      );
      addLog(`✅ Set secure cookie result: ${result}`);
    } catch (error: any) {
      addLog(`❌ Set secure cookie error: ${error.message}`);
    }
  };

  const testGetCookies = async () => {
    try {
      addLog('📋 Getting cookies...');
      const result = await CookiesManager.getCookies('https://httpbin.org');
      setCookies(result);
      addLog(`✅ Got ${result.length} cookies`);

      // Log cada cookie individual
      result.forEach((cookie, index) => {
        addLog(`  ${index + 1}. ${cookie.name} = ${cookie.value}`);
      });
    } catch (error: any) {
      addLog(`❌ Get cookies error: ${error.message}`);
    }
  };

  const testRemoveCookie = async () => {
    try {
      addLog('🗑️ Removing test_cookie...');
      const result = await CookiesManager.removeCookie(
        'https://httpbin.org',
        'test_cookie'
      );
      addLog(`✅ Remove cookie result: ${result}`);
    } catch (error: any) {
      addLog(`❌ Remove cookie error: ${error.message}`);
    }
  };

  const testClearAll = async () => {
    try {
      addLog('🧹 Clearing all cookies...');
      const result = await CookiesManager.clearCookies();
      addLog(`✅ Clear all cookies result: ${result}`);
      setCookies([]);
    } catch (error: any) {
      addLog(`❌ Clear all cookies error: ${error.message}`);
    }
  };

  const testFlush = async () => {
    try {
      addLog('💾 Flushing cookies...');
      await CookiesManager.flush();
      addLog('✅ Flush completed');
    } catch (error: any) {
      addLog(`❌ Flush error: ${error.message}`);
    }
  };

  const runFullTest = async () => {
    addLog('🚀 Starting full test sequence...');
    await testFlush();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testSetCookie();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testSetSecureCookie();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testGetCookies();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testRemoveCookie();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testGetCookies();
    addLog('🎉 Full test sequence completed!');
  };

  const clearLogs = () => {
    setLogs([]);
    setCookies([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍪 Cookies Manager Test</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testSetCookie}>
          <Text style={styles.buttonText}>Set Cookie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecure}
          onPress={testSetSecureCookie}
        >
          <Text style={styles.buttonText}>Set Secure</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGetCookies}>
          <Text style={styles.buttonText}>Get Cookies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonWarning}
          onPress={testRemoveCookie}
        >
          <Text style={styles.buttonText}>Remove Cookie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDanger} onPress={testClearAll}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testFlush}>
          <Text style={styles.buttonText}>Flush</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonSuccess} onPress={runFullTest}>
          <Text style={styles.buttonText}>🚀 Run Full Test</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonClear} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>📋 Cookies ({cookies.length}):</Text>
      {cookies.length === 0 ? (
        <Text style={styles.emptyText}>No cookies found</Text>
      ) : (
        cookies.map((cookie, index) => (
          <View key={index} style={styles.cookieItem}>
            <Text style={styles.cookieText}>
              🍪 {cookie.name} = {cookie.value}
            </Text>
            <Text style={styles.cookieDetails}>
              🌐 Domain: {cookie.domain || 'N/A'}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.subtitle}>📝 Logs:</Text>
      <View style={styles.logContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyLogText}>No logs yet...</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    minWidth: '30%',
    alignItems: 'center',
  },
  buttonSecure: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    minWidth: '30%',
    alignItems: 'center',
  },
  buttonWarning: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    minWidth: '30%',
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    minWidth: '30%',
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#30D158',
    padding: 15,
    borderRadius: 8,
    margin: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonClear: {
    backgroundColor: '#8E8E93',
    padding: 15,
    borderRadius: 8,
    margin: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cookieItem: {
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cookieText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  cookieDetails: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  logContainer: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
    marginBottom: 20,
  },
  logText: {
    color: '#00ff00',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  emptyLogText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
