import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const VerificationScreen = ({ navigation, route }) => {
  const { jobId } = route.params; // Passed from JobDetailsScreen
  const { user, updateUser } = useContext(UserContext); // To get userId and update verification status locally
  const [loading, setLoading] = useState(false);

  // States for images
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [altPhone, setAltPhone] = useState("N/A"); // Default value for optional field

  const API_URL = 'http://10.0.2.2:5067/api/UserDocument/upload';

  const selectImage = (type) => {
    Alert.alert(
      "Select Photo / تصویر منتخب کریں",
      "Choose an option:",
      [
        { text: "Take Photo (Camera)", onPress: () => openPicker('camera', type) },
        { text: "Upload from Gallery", onPress: () => openPicker('gallery', type) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openPicker = async (mode, type) => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const result = mode === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === 'front') setCnicFront(uri);
      if (type === 'back') setCnicBack(uri);
      if (type === 'selfie') setSelfie(uri);
    }
  };

  const handleSubmit = async () => {
    if (!cnicFront || !cnicBack || !selfie) {
      Alert.alert("Error", "Please provide all 3 photos. / تمام تصاویر فراہم کریں۔");
      return;
    }

    setLoading(true);

    // Creating FormData to match the [FromForm] requirements in C#
    const formData = new FormData();
    formData.append('userId', user?.userId || 1); // Use actual logged-in User ID
    formData.append('altPhone', altPhone);
    
    formData.append('front', {
      uri: cnicFront,
      name: 'cnic_front.jpg',
      type: 'image/jpeg',
    });
    formData.append('back', {
      uri: cnicBack,
      name: 'cnic_back.jpg',
      type: 'image/jpeg',
    });
    formData.append('selfie', {
      uri: selfie,
      name: 'selfie.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        // Update local context so the app knows the user is now verified
        updateUser({ ...user, is_verified: 1 });

        Alert.alert(
          "Success", 
          "Documents uploaded successfully! Now you can apply.",
          [{ text: "OK", onPress: () => navigation.goBack() }] // Go back to Job Details to hit Apply again
        );
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Failed to upload documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for the upload boxes
  const UploadBox = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.uploadCard} onPress={onPress}>
      {value ? (
        <Image source={{ uri: value }} style={styles.imagePreview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={40} color="#0056b3" />
          <Text style={styles.placeholderText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Upload</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.instructionTitle}>Complete Your Profile</Text>
        <Text style={styles.instructionSub}>Please upload clear photos of your documents to start applying for jobs.</Text>

        <UploadBox label="CNIC Front Side" value={cnicFront} onPress={() => selectImage('front')} />
        <UploadBox label="CNIC Back Side" value={cnicBack} onPress={() => selectImage('back')} />
        <UploadBox label="Live Selfie" value={selfie} onPress={() => selectImage('selfie')} />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Documents</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    backgroundColor: '#0056b3', 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  scrollContent: { padding: 20 },
  instructionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  instructionSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25, marginTop: 5 },
  uploadCard: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    borderWidth: 2, 
    borderColor: '#e0e0e0', 
    borderStyle: 'dashed', 
    marginBottom: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 10, color: '#0056b3', fontWeight: 'bold' },
  submitBtn: { 
    backgroundColor: '#0056b3', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default VerificationScreen;