import React, { useState, useEffect, useContext } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext'; 

export default function HomeScreen({ navigation }) {
  const { user } = useContext(UserContext); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const API_URL = 'http://10.0.2.2:5067/api/JobPosting'; 

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        id: item.id.toString(),
        title: item.jobTitle,
        company: item.organizationName,
        location: item.location,
        salary: item.salary,
        type: item.jobTiming,
        datePosted: item.datePosted,
      }));

      setJobs(formattedData);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} days ago`;
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('JobDetails', { jobData: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase" size={24} color="#0056b3" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        <Ionicons name="bookmark-outline" size={24} color="#ccc" />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>PKR {item.salary}</Text>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
        <Text style={styles.postedText}>{getTimeAgo(item.datePosted)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <div style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
               <Ionicons name="person-circle" size={80} color="#0056b3" />
               {/* Fixed: Consistent name display */}
               <Text style={styles.sidebarName}>
                 {user?.fullName || user?.full_name || 'Guest User'}
               </Text>
               <Text style={styles.sidebarSub}>{user?.email || 'Worker Profile'}</Text>
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Profile'); }}>
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.menuText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Language'); }}>
              <Ionicons name="language-outline" size={24} color="#333" />
              <Text style={styles.menuText}>App Language</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Support'); }}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
              <Text style={[styles.menuText, {color: '#d32f2f'}]}>Logout</Text>
            </TouchableOpacity>
          </div>
        </TouchableOpacity>
      </Modal>

      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={48} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Welcome</Text>
          {/* ✅ FIXED: Corrected user display logic */}
          <Text style={styles.username}>
              {user?.fullName || user?.full_name || 'Guest User'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search', {searchQuery: ''})}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchText}>Search for jobs (e.g. Driver)...</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recommended Jobs</Text>

        {loading ? (
           <ActivityIndicator size="large" color="#0056b3" style={{marginTop: 20}} />
        ) : (
           <FlatList 
             data={jobs}
             renderItem={renderJobCard}
             keyExtractor={item => item.id}
             showsVerticalScrollIndicator={false}
             contentContainerStyle={{ paddingBottom: 20 }}
           />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    backgroundColor: '#0056b3', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 25, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 8
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTextContainer: { marginTop: 5 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  username: { color: '#fff', fontSize: 26, fontWeight: 'bold', textTransform: 'capitalize' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebar: { width: '75%', height: '100%', backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  sidebarHeader: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 20, marginBottom: 20 },
  sidebarName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  sidebarSub: { fontSize: 14, color: '#666' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuText: { fontSize: 16, marginLeft: 15, color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  content: { flex: 1, padding: 20 },
  searchBar: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  searchText: { color: '#999', marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { width: 50, height: 50, backgroundColor: '#e3f2fd', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  company: { fontSize: 14, color: '#666', marginTop: 2 },
  cardDetails: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, color: '#555', marginLeft: 5 },
  badgeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  badge: { backgroundColor: '#f0f4ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  badgeText: { color: '#0056b3', fontSize: 12, fontWeight: 'bold' },
  postedText: { color: '#999', fontSize: 12 }
});