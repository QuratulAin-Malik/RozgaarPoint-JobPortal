import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  PermissionsAndroid, 
  Platform,
  ActivityIndicator
} from 'react-native';
import Tts from 'react-native-tts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function VoiceGuidedApply({ route, navigation }) {
  const { job } = route.params || { job: { jobTitle: "Job", jobId: 0, id: 0 } }; 
  const jobId = job.jobId || job.id; 

  const [step, setStep] = useState(1); 
  const [photos, setPhotos] = useState({ front: null, back: null, selfie: null });
  const [loading, setLoading] = useState(false); 

  const steps = [
    { id: 1, text: "Please take a photo of the FRONT of your CNIC", voice: "Please take a photo of the FRONT of your CNIC." },
    { id: 2, text: "Now take a photo of the BACK of your CNIC", voice: "Great. Now take a photo of the BACK of your CNIC." },
    { id: 3, text: "Please take a clear selfie of your face", voice: "Final step. Please take a clear selfie of your face." }
  ];

  useEffect(() => {
    Tts.stop();
    Tts.speak(steps[step - 1].voice);
  }, [step]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "Rozgaar Point needs your camera to verify your identity.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Tts.speak("Permission denied. I cannot take a photo without your permission.");
      Alert.alert("Permission Denied", "Camera access is required to apply.");
      return;
    }

    const options = {
      mediaType: 'photo',
      cameraType: step === 3 ? 'front' : 'back',
      saveToPhotos: false,
      quality: 0.7, 
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        Tts.speak("Cancelled.");
      } else if (response.errorMessage) {
        Alert.alert("Camera Error", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        
        const asset = response.assets[0];
        
        const imageFile = {
            uri: asset.uri,
            name: asset.fileName || `photo_${step}.jpg`,
            type: asset.type || 'image/jpeg'
        };

        const newPhotos = { ...photos };
        if (step === 1) newPhotos.front = imageFile;
        else if (step === 2) newPhotos.back = imageFile;
        else if (step === 3) newPhotos.selfie = imageFile;
        
        setPhotos(newPhotos);

        if (step < 3) {
          setStep(step + 1);
        } else {
          await uploadApplication(newPhotos);
        }
      }
    });
  };

  // 🛠️ UPDATED: Now reads raw text to show Server Errors
  const uploadApplication = async (finalPhotos) => {
    setLoading(true);
    Tts.stop();
    Tts.speak("Please wait. Uploading your documents.");

    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert("Error", "You are not logged in.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('JobId', jobId); 
        
        if (finalPhotos.front) {
            formData.append('frontImage', {
                uri: finalPhotos.front.uri,
                name: finalPhotos.front.name,
                type: finalPhotos.front.type
            });
        }
        if (finalPhotos.back) {
            formData.append('backImage', {
                uri: finalPhotos.back.uri,
                name: finalPhotos.back.name,
                type: finalPhotos.back.type
            });
        }
        if (finalPhotos.selfie) {
            formData.append('selfieImage', {
                uri: finalPhotos.selfie.uri,
                name: finalPhotos.selfie.name,
                type: finalPhotos.selfie.type
            });
        }

        const response = await fetch('http://10.0.2.2:5067/api/JobApplication/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        // ✅ CRITICAL CHANGE: Read response as Text first
        const responseText = await response.text();
        console.log("Server Response:", responseText); 

        if (response.ok) {
            // Only try to parse JSON if the response was OK
            const result = JSON.parse(responseText);
            Tts.speak(`Thank you. Your application for ${job.jobTitle} is submitted.`);
            Alert.alert("Success", "Application Submitted Successfully!");
            navigation.popToTop(); 
        } else {
            // If server failed, SHOW THE RAW TEXT ERROR (The one starting with S)
            Alert.alert("Server Error", responseText);
            Tts.speak("Sorry, the server returned an error.");
        }

    } catch (error) {
        console.error("Network Error:", error);
        Alert.alert("App Error", error.message);
        Tts.speak("There was a network error.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step {step} of 3</Text>
        <Text style={styles.jobText}>Applying for: {job.jobTitle}</Text>
      </View>
      
      <Text style={styles.instructionText}>{steps[step-1].text}</Text>
      
      <TouchableOpacity style={styles.cameraBox} onPress={takePhoto} disabled={loading}>
        {loading ? (
            <ActivityIndicator size="large" color="#0056b3" />
        ) : (
            <>
                <Ionicons name="camera" size={100} color="#0056b3" />
                <Text style={styles.cameraLabel}>Tap to take Photo</Text>
            </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.repeatButton} onPress={() => Tts.speak(steps[step-1].voice)}>
        <Ionicons name="volume-high" size={60} color="#0056b3" />
        <Text style={styles.repeatLabel}>Dobara Sunaen (Repeat)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { position: 'absolute', top: 60, alignItems: 'center' },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#0056b3' },
  jobText: { fontSize: 16, color: '#666', marginTop: 5 },
  instructionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 40, color: '#333' },
  cameraBox: { width: '100%', height: 250, backgroundColor: '#fff', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#0056b3', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  cameraLabel: { marginTop: 10, fontSize: 16, color: '#0056b3', fontWeight: 'bold' },
  repeatButton: { marginTop: 50, alignItems: 'center' },
  repeatLabel: { marginTop: 10, fontSize: 14, color: '#0056b3', fontWeight: 'bold' }
});