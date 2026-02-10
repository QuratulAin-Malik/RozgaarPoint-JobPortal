import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  PermissionsAndroid, 
  Platform,
  ActivityIndicator,
  Animated,
  Alert 
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext'; 

const VoiceModeScreen = ({ navigation }) => {
  const { user } = useContext(UserContext); 
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState([]);
  const [partialText, setPartialText] = useState(""); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const volumeValue = useRef(new Animated.Value(1)).current;
  const API_URL = 'http://10.0.2.2:5067/api/JobPosting'; 

  const getJobIcon = (title) => {
    const lowTitle = (title || "").toLowerCase();
    if (lowTitle.includes('driver')) return { name: 'car-outline', color: '#FF9800' };
    if (lowTitle.includes('security') || lowTitle.includes('guard')) return { name: 'shield-checkmark-outline', color: '#f44336' };
    if (lowTitle.includes('cleaner') || lowTitle.includes('maid')) return { name: 'water-outline', color: '#2196F3' };
    if (lowTitle.includes('cook') || lowTitle.includes('chef')) return { name: 'restaurant-outline', color: '#4CAF50' };
    if (lowTitle.includes('waiter')) return { name: 'fast-food-outline', color: '#E91E63' };
    return { name: 'briefcase-outline', color: '#0056b3' }; 
  };

  const speakFullDetails = (item) => {
    const detailText = `
      Job Title is ${item.jobTitle}. 
      Organization name is ${item.organizationName}. 
      Location is ${item.location}. 
      Salary is ${item.salary} rupees. 
      Work Description is ${item.jobDescription || "Not provided"}.
      Skills needed are ${item.skills || "Basic work"}.
      Experience level is ${item.experienceLevel || "Fresh"}.
      To apply, press the green button Apply Now.
    `;
    Tts.stop();
    Tts.speak(detailText);
  };

  useEffect(() => {
    Tts.setDefaultLanguage('en-US'); 
    Tts.setDefaultRate(0.45); 
    Tts.speak("Please hold the microphone button and tell me what job you are looking for.");

    fetchJobs(''); 

    const requestMicPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        } catch (err) { console.warn(err); }
      }
    };
    requestMicPermission();

    Voice.onSpeechStart = () => {
        setIsListening(true);
        setPartialText(""); 
    };
    
    Voice.onSpeechPartialResults = (e) => {
        if (e.value && e.value[0]) {
            setPartialText(e.value[0]); 
        }
    };

    Voice.onSpeechEnd = () => { 
        setIsListening(false); 
        resetWave(); 
    };
    
    Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
            const finalSpoken = e.value[0];
            setPartialText(finalSpoken); 
            setResults(e.value);
            fetchJobs(finalSpoken); 
        }
    };

    Voice.onSpeechVolumeChanged = (e) => {
        const newScale = 1 + (e.value / 10); 
        Animated.spring(volumeValue, { toValue: newScale, useNativeDriver: true, friction: 3 }).start();
    };

    return () => {
      Tts.stop();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const resetWave = () => {
    Animated.timing(volumeValue, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const fetchJobs = async (searchQuery = '') => {
    setLoading(true);
    if (searchQuery) Tts.speak(`Searching for ${searchQuery} jobs`); 

    try {
      const response = await fetch(`${API_URL}`); 
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        id: (item.id || item.Id).toString(),
        jobTitle: item.jobTitle || item.JobTitle,
        organizationName: item.organizationName || item.OrganizationName,
        location: item.location || item.Location,
        salary: item.salary || item.Salary,
        jobDescription: item.jobDescription || item.JobDescription,
        skills: item.skills || item.Skills,
        experienceLevel: item.experienceLevel || item.ExperienceLevel
      }));

      const filtered = searchQuery === '' 
        ? formattedData 
        : formattedData.filter(job => 
            job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
          );

      setJobs(filtered);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    try { Tts.stop(); setPartialText(""); await Voice.start('en-US'); } catch (e) { console.error(e); }
  };

  const stopListening = async () => {
    try { await Voice.stop(); setIsListening(false); } catch (e) { console.error(e); }
  };

  const renderJobCard = ({ item }) => {
    const iconData = getJobIcon(item.jobTitle);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: iconData.color + '20' }]}>
            <Ionicons name={iconData.name} size={32} color={iconData.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <Text style={styles.company}>{item.organizationName}</Text>
            <Text style={styles.salaryText}>Rs. {item.salary?.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => Tts.speak(`${item.jobTitle} at ${item.organizationName}`)}>
            <Ionicons name="refresh-circle" size={45} color="#0056b3" />
            <Text style={styles.miniLabel}>Listen</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.detailsBtn} onPress={() => speakFullDetails(item)}>
            <Ionicons name="information-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Listen to Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => {
              Tts.stop();
              // ✅ FIX: Navigation route name changed to match App.js
              navigation.navigate('VoiceGuidedApply', { job: item }); 
            }}
          >
            <Text style={styles.btnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0056b3" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Speak to Find Jobs</Text>
      </View>

      <View style={styles.voiceWrapper}>
        <Text style={styles.recognizedText}>
            {partialText || "Search Jobs by Voice"}
        </Text>

        <View style={styles.micContainer}>
            {isListening && <Animated.View style={[styles.waveCircle, { transform: [{ scale: volumeValue }] }]} />}
            <TouchableOpacity 
              style={[styles.micCircle, isListening && styles.micActive]}
              onPressIn={startListening} onPressOut={stopListening}
            >
              <Ionicons name={isListening ? "stop" : "mic"} size={60} color={isListening ? "red" : "#0056b3"} />
            </TouchableOpacity>
        </View>
        <Text style={styles.instruction}>{isListening ? "Listening..." : "Hold button to speak"}</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#0056b3" /> : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#0056b3', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backButton: { marginRight: 15 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  voiceWrapper: { alignItems: 'center', marginVertical: 20 },
  recognizedText: { fontSize: 18, color: '#0056b3', fontWeight: 'bold', marginBottom: 10, textAlign: 'center', paddingHorizontal: 20 },
  micContainer: { justifyContent: 'center', alignItems: 'center', width: 180, height: 180 },
  waveCircle: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(0, 86, 179, 0.2)', borderWidth: 1, borderColor: '#0056b3' },
  micCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 10, borderWidth: 3, borderColor: '#0056b3' },
  micActive: { borderColor: 'red' },
  instruction: { marginTop: 15, fontSize: 16, color: '#555' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 30 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  company: { fontSize: 15, color: '#666' },
  salaryText: { fontSize: 16, color: '#28a745', fontWeight: 'bold', marginTop: 2 },
  actionButton: { alignItems: 'center', marginLeft: 10 },
  miniLabel: { fontSize: 10, color: '#0056b3', fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  detailsBtn: { flex: 1.2, backgroundColor: '#6c757d', flexDirection: 'row', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  applyBtn: { flex: 0.8, backgroundColor: '#28a745', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
});

export default VoiceModeScreen;