import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ModeSelectionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Mode</Text>
      <Text style={styles.subTitle}>اپنا طریقہ منتخب کریں</Text>

      <View style={styles.row}>
        {/* VOICE MODE - Updated to navigate to VoiceModeScreen */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('VoiceMode')}
        >
          <Ionicons name="mic-circle" size={80} color="#0056b3" />
          <Text style={styles.cardText}>Speak</Text>
          <Text style={styles.modeSubText}>(Voice Mode)</Text>
        </TouchableOpacity>

        {/* TEXT MODE - Navigates to the Bottom Tab Navigator */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="document-text" size={80} color="#0056b3" />
          <Text style={styles.cardText}>Read & Type</Text>
          <Text style={styles.modeSubText}>(Text Mode)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subTitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  row: { flexDirection: 'row', gap: 20 },
  card: { padding: 20, borderWidth: 2, borderColor: '#eee', borderRadius: 20, alignItems: 'center', width: 160, backgroundColor: '#fdfdfd', elevation: 3 },
  cardText: { fontSize: 18, fontWeight: 'bold', color: '#0056b3', marginTop: 10 },
  modeSubText: { fontSize: 12, color: '#666' }
});