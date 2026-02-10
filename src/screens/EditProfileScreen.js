import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  // Local state for the form inputs
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState(user.location);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateUser({ name, phone, location, email });
      setLoading(false);
      Alert.alert("Success", "Profile Updated Successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Edit Profile</Text>
         <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        <Text style={styles.label}>Location / City</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Lahore" />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15, height: 50, backgroundColor: '#f9f9f9' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16 },
  saveButton: { backgroundColor: '#0056b3', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 2 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});