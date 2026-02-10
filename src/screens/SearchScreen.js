import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // 1. STATE: This is where your DB data will live later
  const [searchResults, setSearchResults] = useState([]);

  // 2. API HOOK: Connect your Search API here later
  useEffect(() => {
    // Example: fetch(`http://.../api/search?q=${searchQuery}`)
  }, [searchQuery, activeFilter]);

  // Dummy filter chips (You can fetch these from DB too)
  const filters = ['All', 'Karachi', 'Lahore', 'Factory', 'Driver', 'Security'];

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('JobDetails', { jobData: item })} // Navigates to details
    >
      <View style={styles.cardHeader}>
        <View>
            <Text style={styles.jobTitle}>{item.title || "Job Title"}</Text>
            <Text style={styles.companyName}>{item.company || "Company Name"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.location}>{item.location || "Location"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput 
                placeholder="Search jobs, companies..." 
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList 
            horizontal
            data={filters}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={[styles.chip, activeFilter === item && styles.activeChip]}
                    onPress={() => setActiveFilter(item)}
                >
                    <Text style={[styles.chipText, activeFilter === item && styles.activeChipText]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            )}
        />
      </View>

      {/* Results List */}
      <FlatList 
        data={searchResults}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderJobItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
            <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Search for your next job</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { backgroundColor: '#0056b3', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 10, alignItems: 'center' },
  input: { marginLeft: 10, flex: 1, fontSize: 16 },
  filterContainer: { paddingVertical: 15, paddingLeft: 20 },
  chip: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  activeChip: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  chipText: { color: '#666' },
  activeChipText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  companyName: { color: '#0056b3', fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  location: { color: '#666', fontSize: 12, marginLeft: 5 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});