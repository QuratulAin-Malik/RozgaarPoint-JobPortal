import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  // 1. STATE: User Profile Data
  const [user, setUser] = useState({
    name: 'User Name', // Placeholder until API connects
    email: 'user@example.com',
    role: 'Job Seeker'
  });

  // --- ACTIONS ---

  // 1. Logout Function
  const handleLogout = () => {
    Alert.alert(
      "Logout", 
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: 'destructive', 
          onPress: () => {
            // Reset navigation so user cannot go back
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // --- COMPONENT ---
  const OptionItem = ({ icon, title, color = '#333', onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={styles.optionLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                <Ionicons name={icon} size={20} color={color === '#d32f2f' ? color : "#0056b3"} />
            </View>
            <Text style={[styles.optionText, { color }]}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
            <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon!")}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {/* ✅ NAVIGATE TO RESUME SCREEN */}
        <OptionItem 
          icon="document-text-outline" 
          title="My Resume / CV" 
          onPress={() => navigation.navigate('Resume')} 
        />
        
        {/* ✅ NAVIGATE TO LANGUAGE SCREEN */}
        <OptionItem 
          icon="language-outline" 
          title="Language (ENG | اردو)" 
          onPress={() => navigation.navigate('Language')}
        />
        
        {/* ✅ NAVIGATE TO NOTIFICATIONS SCREEN */}
        <OptionItem 
          icon="notifications-outline" 
          title="Notifications" 
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        {/* ✅ NAVIGATE TO SUPPORT SCREEN */}
        <OptionItem 
          icon="help-circle-outline" 
          title="Help & Support" 
          onPress={() => navigation.navigate('Support')}
        />
        
        {/* ✅ NAVIGATE TO TERMS SCREEN */}
        <OptionItem 
          icon="information-circle-outline" 
          title="Terms & Privacy" 
          onPress={() => navigation.navigate('Terms')}
        />
        
        {/* ✅ LOGOUT BUTTON */}
        <OptionItem 
          icon="log-out-outline" 
          title="Logout" 
          color="#d32f2f" 
          onPress={handleLogout} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#0056b3', alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileImageContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'white' },
  name: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  email: { color: '#e0e0e0', fontSize: 14, marginBottom: 15 },
  editBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: '#0056b3', fontWeight: 'bold', fontSize: 12 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 35, height: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  optionText: { fontSize: 15, fontWeight: '500' }
});