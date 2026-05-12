import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HumanVerificationProps {
  onVerified: () => void;
}

export default function HumanVerification({ onVerified }: HumanVerificationProps) {
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 6) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setUserAnswer('');
    setError('');
  };

  const verifyAnswer = () => {
    if (parseInt(userAnswer) === captcha.answer) {
      setIsVerified(true);
      onVerified();
    } else {
      setAttempts(attempts + 1);
      setError('Incorrecto. Intenta de nuevo.');
      generateCaptcha();
    }
  };

  if (isVerified) {
    return (
      <View style={[styles.container, styles.verified]}>
        <Ionicons name="checkmark-circle" size={40} color="#06d6a0" />
        <Text style={styles.verifiedText}>Verificado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación de Humano</Text>
      
      <View style={styles.captchaBox}>
        <Text style={styles.captchaText}>
          ¿Cuánto es {captcha.num1} + {captcha.num2}?
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ingresa la respuesta:</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '1')}
            >1</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '2')}
            >2</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '3')}
            >3</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '4')}
            >4</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '5')}
            >5</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '6')}
            >6</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '7')}
            >7</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '8')}
            >8</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '9')}
            >9</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer.slice(0, -1))}
            >⌫</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={styles.numberBtn}
              onPress={() => setUserAnswer(userAnswer + '0')}
            >0</Text>
          </View>
          <View style={styles.inputBox}>
            <Text 
              style={[styles.numberBtn, styles.verifyBtn]}
              onPress={verifyAnswer}
            >✓</Text>
          </View>
        </View>
      </View>

      <Text style={styles.displayAnswer}>
        Respuesta: {userAnswer || '...'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {attempts > 0 && (
        <Text style={styles.attempts}>Intentos: {attempts}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  verifiedText: {
    color: '#06d6a0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  captchaBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.3)',
  },
  captchaText: {
    color: '#ff8a00',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputBox: {
    width: (width - 80) / 3,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBtn: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  verifyBtn: {
    color: '#06d6a0',
    backgroundColor: 'rgba(6,214,160,0.2)',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    lineHeight: 50,
    borderRadius: 10,
  },
  displayAnswer: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 4,
  },
  error: {
    color: '#ff006e',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  attempts: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
});