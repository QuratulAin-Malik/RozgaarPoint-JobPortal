import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native'; // ✅ Important: Refreshes list when you come back

export default function ActivityScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const isFocused = useIsFocused(); // triggers refresh

  // ✅ YOUR BACKEND URL
  const API_URL = 'http://10.0.2.2:5067/api/JobApplication'; 

  // 1. Fetch Data from Database
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      // Map C# Backend Data to UI
      const formattedData = data.map(item => ({
        id: item.id,
        jobTitle: item.jobTitle || "Job Position",
        company: item.organizationName || "Company Name", 
        status: item.status || "Pending",
        date: item.appliedDate ? new Date(item.appliedDate).toLocaleDateString() : "Recent",
        progress: calculateProgress(item.status),
        ...item // Keep all other data
      }));

      setApplications(formattedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh whenever screen is focused
  useEffect(() => {
    if (isFocused) {
        fetchApplications();
    }
  }, [isFocused]);

  // Helper: Convert Status text to Progress Number (1-4)
  const calculateProgress = (status) => {
    if (!status) return 1;
    const s = status.toLowerCase();
    if (s === 'hired' || s === 'rejected') return 4;
    if (s === 'interview') return 3;
    if (s === 'reviewed') return 2;
    return 1;
  };

  // 2. Handle Delete (Frontend + Backend optional)
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Application",
      "Remove this from your history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
             // For now, just remove from UI. 
             // To delete from DB, you would add a DELETE fetch call here.
             setApplications(prev => prev.filter(app => app.id !== id));
          } 
        }
      ]
    );
  };

  const getFilteredData = () => {
    if (activeTab === 'All') return applications;
    if (activeTab === 'Active') return applications.filter(app => ['Pending', 'Reviewed', 'Interview'].includes(app.status));
    if (activeTab === 'History') return applications.filter(app => ['Hired', 'Rejected'].includes(app.status));
    return applications;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'Reviewed': return '#3498db';
      case 'Hired': return '#2ecc71';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{item.jobTitle}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
        </View>
        
        {/* Status Badge */}
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20', marginRight: 10 }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.dot, step <= item.progress && styles.activeDot]} />
            {step < 4 && <View style={[styles.line, step < item.progress && styles.activeLine]} />}
          </View>
        ))}
        <Text style={styles.progressText}>
            {item.status === 'Rejected' ? 'Closed' : (item.progress === 1 ? 'Applied' : 'In Progress')}
        </Text>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}><Ionicons name="calendar-outline" /> Applied: {item.date}</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { jobData: item })}>
          <Text style={styles.detailsLink}>View Details ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
      </View>

      <View style={styles.tabs}>
        {['All', 'Active', 'History'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={{marginTop: 50}} />
      ) : (
        <FlatList
            data={getFilteredData()}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
            <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No applications found.</Text>
            </View>
            }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  tabs: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
  tabItem: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, backgroundColor: '#f0f0f0' },
  activeTabItem: { backgroundColor: '#0056b3' },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  companyName: { fontSize: 14, color: '#666', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#999' },
  detailsLink: { fontSize: 14, color: '#0056b3', fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#eee' },
  activeDot: { backgroundColor: '#0056b3' },
  line: { width: 30, height: 2, backgroundColor: '#eee' },
  activeLine: { backgroundColor: '#0056b3' },
  progressText: { marginLeft: 10, fontSize: 12, color: '#0056b3', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', marginTop: 10 }
});