import React, { useState, useEffect } from 'react'; // Added useEffect
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Country & OTP State
  const [countryCode, setCountryCode] = useState('PK'); 
  const [callingCode, setCallingCode] = useState('92');
  const [otpCode, setOtpCode] = useState('');

  // --- NEW: TIMER STATE ---
  const [timer, setTimer] = useState(30); // 30-second countdown
  const [canResend, setCanResend] = useState(false);

  // --- NEW: COUNTDOWN LOGIC ---
  useEffect(() => {
    let interval;
    if (isOtpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, timer]);

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  // STEP 1 & RESEND: Register and Send OTP
  const handleRegisterInit = async () => {
    if (!fullName || !email || pin.length !== 4 || !phoneNumber) {
      Alert.alert("Error", "Please fill all fields. PIN must be 4 digits.");
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post('http://10.0.2.2:5067/api/Auth/send-otp', {
        full_name: fullName,
        email: email,
        password_hash: pin, 
        phone_number: phoneNumber,
        country_code: `+${callingCode}`,
        country_iso: countryCode,
        terms_accepted: true,
        privacy_accepted: true
      });
      
      // Reset timer on success
      setTimer(30);
      setCanResend(false);
      setIsOtpStep(true);
      
      Alert.alert("Success", "OTP sent to your Gmail!");
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data || "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 4) {
      Alert.alert("Error", "Please enter the 4-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5067/api/Auth/verify-otp', {
        email: email,
        otp: otpCode
      });

      if (response.status === 200) {
        Alert.alert(
          "Success", 
          "Registration Successful!", 
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert("Verification Failed", error.response?.data || "Incorrect OTP Code");
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

        {!isOtpStep ? (
          <View>
            <Text style={styles.subtitle}>Create your account / اکاؤنٹ بنائیں</Text>
            
            <Text style={styles.label}>Full Name / پورا نام</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full Name" />

            <Text style={styles.label}>Email Address / ای میل</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>4-Digit Login PIN / لاگ ان پن</Text>
            <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="****" keyboardType="numeric" maxLength={4} secureTextEntry={true} />

            <Text style={styles.label}>Select Country / ملک منتخب کریں</Text>
            <View style={styles.countryPickerContainer}>
               <CountryPicker {...{ countryCode, withFilter: true, withFlag: true, withCallingCode: true, onSelect: onSelectCountry }} />
              <Text style={styles.selectedCountryText}>Selected: {countryCode} (+{callingCode})</Text>
            </View>

            <Text style={styles.label}>Phone Number / فون نمبر</Text>
            <View style={styles.phoneInputContainer}>
                <View style={styles.callingCodeBox}><Text style={styles.callingCodeText}>+{callingCode}</Text></View>
                <TextInput style={styles.phoneInput} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="3001234567" keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegisterInit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register & Send OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
             <Text style={styles.subtitle}>Enter OTP Code / کوڈ درج کریں</Text>
             <Text style={styles.otpGuidance}>Sent to: {email}</Text>
             <TextInput 
                style={styles.otpInput} 
                value={otpCode} 
                onChangeText={setOtpCode} 
                placeholder="0000" 
                keyboardType="numeric" 
                maxLength={4} 
            />
             <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Complete</Text>}
             </TouchableOpacity>

             {/* --- RESEND BUTTON & TIMER UI --- */}
             <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleRegisterInit}>
                    <Text style={styles.linkText}>Resend OTP / دوبارہ کوڈ بھیجیں</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>Resend available in {timer}s</Text>
                )}
             </View>

             <TouchableOpacity onPress={() => setIsOtpStep(false)} style={{ marginTop: 10 }}>
                <Text style={styles.editLinkText}>Edit details / دوبارہ کوشش کریں</Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#fff', flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0056b3', textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  otpGuidance: { textAlign: 'center', color: '#888', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#f9f9f9', fontSize: 16 },
  countryPickerContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15, backgroundColor: '#f9f9f9' },
  selectedCountryText: { marginLeft: 10, color: '#555', fontWeight: '500' },
  phoneInputContainer: { flexDirection: 'row', marginBottom: 20 },
  callingCodeBox: { width: 65, height: 50, borderWidth: 1, borderColor: '#ddd', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
  callingCodeText: { fontWeight: 'bold', color: '#333' },
  phoneInput: { flex: 1, height: 50, borderWidth: 1, borderLeftWidth: 0, borderColor: '#ddd', borderTopRightRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 15, backgroundColor: '#f9f9f9', fontSize: 16 },
  button: { height: 55, backgroundColor: '#0056b3', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  otpInput: { height: 65, borderWidth: 1, borderColor: '#0056b3', borderRadius: 8, textAlign: 'center', fontSize: 28, letterSpacing: 12, marginBottom: 20, backgroundColor: '#f0f8ff' },
  resendContainer: { marginTop: 25, alignItems: 'center' },
  timerText: { color: '#888', fontSize: 15 },
  linkText: { color: '#0056b3', fontWeight: 'bold', fontSize: 16 },
  editLinkText: { color: '#666', textAlign: 'center', marginTop: 15 }
});

export default RegisterScreen;