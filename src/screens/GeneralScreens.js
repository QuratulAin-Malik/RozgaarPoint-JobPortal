import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- 1. NOTIFICATIONS SCREEN ---
export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Welcome to Rozgaar Point', desc: 'Complete your profile to get better job matches.', time: '2 hrs ago' },
    { id: '2', title: 'Profile Verified', desc: 'Your CNIC verification was successful.', time: '1 day ago' },
    { id: '3', title: 'New Job Alert', desc: 'A new driver job is available in your area.', time: '2 days ago' },
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={20} color="#0056b3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

// --- 2. LANGUAGE SCREEN ---
export const LanguageScreen = () => {
  const [selected, setSelected] = useState('eng');

  const LangOption = ({ id, label, native }) => (
    <TouchableOpacity 
      style={[styles.langOption, selected === id && styles.langSelected]} 
      onPress={() => setSelected(id)}
    >
      <View>
        <Text style={[styles.langLabel, selected === id && { color: '#0056b3' }]}>{label}</Text>
        <Text style={styles.langNative}>{native}</Text>
      </View>
      {selected === id && <Ionicons name="checkmark-circle" size={24} color="#0056b3" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Choose Language / زبان منتخب کریں</Text>
      <LangOption id="eng" label="English" native="English" />
      <LangOption id="ur" label="Urdu" native="اردو" />
      
      <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Success", "Language saved!")}>
        <Text style={styles.saveButtonText}>Save / محفوظ کریں</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- 3. SUPPORT SCREEN ---
export const SupportScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.headerTitle}>How can we help?</Text>
      <Text style={styles.subText}>Fill out the form below and our team will contact you shortly.</Text>

      <Text style={styles.label}>Subject</Text>
      <TextInput style={styles.input} placeholder="e.g. Login Issue" />

      <Text style={styles.label}>Message</Text>
      <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Describe your issue..." multiline />

      <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Sent", "We have received your message!")}>
        <Text style={styles.saveButtonText}>Submit Ticket</Text>
      </TouchableOpacity>

      <View style={styles.contactInfo}>
        <Ionicons name="call" size={20} color="#666" />
        <Text style={{ marginLeft: 10, color: '#666' }}>Helpline: 0800-12345</Text>
      </View>
    </ScrollView>
  );
};

// --- 4. TERMS SCREEN ---
export const TermsScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.textWrapper}>
      <Text style={styles.policyHeader}>Privacy Policy</Text>
      <Text style={styles.policyText}>
        1. We collect your data to provide job matches.{'\n'}
        2. Your CNIC data is used for verification only.{'\n'}
        3. We do not share your personal number without consent.
      </Text>
      
      <Text style={styles.policyHeader}>Terms of Service</Text>
      <Text style={styles.policyText}>
        By using Rozgaar Point, you agree to act professionally. Misconduct may result in account suspension.
      </Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  scrollContainer: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  cardDesc: { color: '#666', marginVertical: 4 },
  cardTime: { color: '#999', fontSize: 12 },
  
  // Language Styles
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  langSelected: { borderColor: '#0056b3', backgroundColor: '#f0f8ff' },
  langLabel: { fontSize: 18, fontWeight: '600', color: '#333' },
  langNative: { color: '#666', marginTop: 2 },
  
  // Form Styles
  subText: { color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  contactInfo: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },

  // Terms Styles
  textWrapper: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  policyHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 10 },
  policyText: { color: '#555', lineHeight: 22, marginBottom: 20 },
});