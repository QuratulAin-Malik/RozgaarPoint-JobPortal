import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // ✅ The fixed library
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ResumeScreen() {
  const [resumeImage, setResumeImage] = useState(null);

  const uploadResume = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setResumeImage(response.assets[0].uri);
        Alert.alert("Success", "Resume uploaded successfully!");
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Resume / CV</Text>
      
      <View style={styles.card}>
        {resumeImage ? (
          <Image source={{ uri: resumeImage }} style={styles.previewImage} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.placeholderText}>No Resume Uploaded</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={uploadResume}>
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.uploadButtonText}>
            {resumeImage ? "Change Resume" : "Upload Resume"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f9f9f9', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 3 },
  previewImage: { width: '100%', height: 400, borderRadius: 10, marginBottom: 20 },
  placeholder: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 20 },
  placeholderText: { color: '#888', marginTop: 10 },
  uploadButton: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center' },
  uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});