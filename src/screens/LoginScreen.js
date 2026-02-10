import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../context/UserContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- IMPORTED THIS

const LoginScreen = ({ navigation }) => {
  const { updateUser } = useContext(UserContext); 

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please enter your Name, Email, and PIN.");
      return;
    }

    if (password.length !== 4) {
      Alert.alert("Error", "PIN must be exactly 4 digits.");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = 'http://10.0.2.2:5067/api/Auth/login'; 
      
      const payload = {
        FullName: fullName,
        Email: email,
        Password: password 
      };

      const response = await axios.post(apiUrl, payload);

      if (response.status === 200) {
        // --- FIX START: Save the Token! ---
        // Assuming your API returns { token: "...", userId: 123, ... }
        // If your API calls it 'token' or 'jwt', change the word below accordingly.
        const token = response.data.token; 
        
        if (token) {
            await AsyncStorage.setItem('userToken', token);
            console.log("Token saved successfully:", token);
        } else {
            console.warn("Login successful but no Token received from server.");
        }
        // --- FIX END ---

        Alert.alert("Success", `Welcome back, ${response.data.fullName}!`);
        
        updateUser({
          userId: response.data.userId,
          fullName: response.data.fullName, 
          email: email
        });

        navigation.replace('LanguageSelection'); 
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        Alert.alert("Login Failed", error.response.data || "Invalid credentials.");
      } else {
        Alert.alert("Connection Error", "Could not connect to the Rozgaar Point server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Rozgaar Point</Text>
        <Text style={styles.subtitle}>Login to find work / لاگ ان کریں</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name / پورا نام</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email Address / ای میل</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>4-Digit PIN / پن کوڈ</Text>
          <TextInput
            style={styles.input}
            placeholder="****"
            keyboardType="numeric"
            secureTextEntry={true}
            maxLength={4}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0056b3', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 40, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { height: 55, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, marginBottom: 20, fontSize: 16, backgroundColor: '#fafafa' },
  loginButton: { height: 55, backgroundColor: '#0056b3', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 2 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#666', fontSize: 15 },
  linkText: { color: '#0056b3', fontSize: 15, fontWeight: 'bold' },
});

export default LoginScreen;