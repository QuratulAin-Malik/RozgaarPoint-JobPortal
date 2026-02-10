import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext'; 

export default function JobDetailsScreen({ route, navigation }) {
  const { jobData } = route.params;
  const { user } = useContext(UserContext); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // YOUR API URL
  const APPLICATION_API_URL = 'http://10.0.2.2:5067/api/JobApplication/apply'; 

  // Debugging: Keep this to see exactly what the API is sending in your console
  useEffect(() => {
    console.log("Rozgaar Point - Current Job Data:", jobData);
  }, [jobData]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString();
  };

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      // Robust check for user verification status
      const isVerified = user?.is_verified === 1 || user?.isVerified === true;

      if (!isVerified) {
        Alert.alert(
          "Documents Required",
          "Please upload your CNIC and a selfie to complete your profile before applying.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Upload Now", 
              onPress: () => navigation.navigate('Verification', { jobId: jobData.id || jobData.Id }) 
            }
          ]
        );
        setIsSubmitting(false);
        return;
      }

      const payload = {
        jobId: parseInt(jobData.id || jobData.Id),
        userId: user?.userId || 1, 
        status: "Pending",
        appliedDate: new Date().toISOString()
      };

      const response = await fetch(APPLICATION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", "Application Submitted Successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert("Notice", errorData.message || "Already applied or server error.");
      }
    } catch (error) {
      Alert.alert("Error", "Check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.navRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="#333" />
        </View>
        
        {/* Mapped to JobTitle (Pascal/Camel) */}
        <Text style={styles.jobTitle}>
          {jobData.jobTitle || jobData.JobTitle || jobData.title}
        </Text>
        
        {/* Mapped to OrganizationName and Location */}
        <Text style={styles.companyInfo}>
           {jobData.organizationName || jobData.OrganizationName || jobData.company} • {jobData.location || jobData.Location}
        </Text>

        <View style={styles.rowBetween}>
            <View style={styles.tagContainer}>
                {/* Mapped to JobTiming */}
                <Text style={styles.tagText}>
                  {jobData.jobTiming || jobData.JobTiming || jobData.type}
                </Text>
            </View>
            <Text style={styles.dateText}>
              Posted: {formatDate(jobData.datePosted || jobData.DatePosted)}
            </Text>
        </View>
      </View>

      <ScrollView style={{ padding: 20 }}>
        
        {/* --- SALARY --- */}
        <View style={styles.card}>
            <Text style={styles.cardLabel}>Salary (PKR)</Text>
            <Text style={styles.salaryText}>
                {jobData.salary || jobData.Salary ? 
                  `Rs. ${(jobData.salary || jobData.Salary).toLocaleString()}` : 
                  "Negotiable"}
            </Text>
        </View>

        {/* --- DESCRIPTION --- */}
        <Text style={styles.sectionHeader}>Job Description</Text>
        <Text style={styles.descriptionText}>
          {/* Mapped to JobDescription property from your C# class */}
          {jobData.jobDescription || jobData.JobDescription || jobData.description || "No description provided."}
        </Text>

        {/* --- REQUIREMENTS SECTION --- */}
        <View style={styles.card}>
            <Text style={[styles.cardLabel, { marginBottom: 10 }]}>Candidate Requirements</Text>

            {(jobData.isCnicRequired === true || jobData.IsCnicRequired === true) && (
                <View style={styles.row}>
                    <Ionicons name="card-outline" size={20} color="#555" />
                    <Text style={styles.requirementText}>Valid CNIC Required</Text>
                </View>
            )}

            <View style={styles.row}>
                <Ionicons name="calendar-outline" size={20} color="#555" />
                <Text style={styles.requirementText}> 
                    Age: {jobData.ageRange || jobData.AgeRange || "No Age Limit"}
                </Text>
            </View>

            <View style={styles.row}>
                <Ionicons name="person-outline" size={20} color="#555" />
                <Text style={styles.requirementText}> 
                    Gender: {jobData.genderPreference || jobData.GenderPreference || jobData.gender || "Any"}
                </Text>
            </View>

            <View style={styles.row}>
                <Ionicons name="briefcase-outline" size={20} color="#555" />
                <Text style={styles.requirementText}> 
                    Experience: {jobData.experienceLevel || jobData.ExperienceLevel || jobData.experience || "Fresh"}
                </Text>
            </View>

            <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                <Text style={{ fontWeight: 'bold', color: '#555' }}>Required Skills:</Text>
                <Text style={{ color: '#0056b3', marginTop: 2, fontWeight: '600' }}>
                    {jobData.skills || jobData.Skills || "None Listed"}
                </Text>
            </View>
        </View>

        {/* --- CONTACT INFORMATION --- */}
        <View style={[styles.card, { marginBottom: 80 }]}>
            <Text style={styles.cardLabel}>Contact Information</Text>
            
            <View style={styles.row}>
                <Ionicons name="mail-outline" size={18} color="#0056b3" />
                <Text style={styles.contactText}> 
                    {jobData.contactEmail || jobData.ContactEmail || jobData.email || "Email Hidden"}
                </Text>
            </View>
            
            <View style={styles.row}>
                <Ionicons name="call-outline" size={18} color="#0056b3" />
                <Text style={styles.contactText}> 
                    {jobData.contactPhone || jobData.ContactPhone || jobData.phone || "Phone Hidden"}
                </Text>
            </View>
        </View>

      </ScrollView>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.applyButton} 
            onPress={handleApply}
            disabled={isSubmitting}
        >
            {isSubmitting ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.applyButtonText}>Confirm Application</Text>
            )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  navRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 15 },
  jobTitle: { fontSize: 24, fontWeight: 'bold', color: '#0056b3' },
  companyInfo: { fontSize: 16, color: '#555', marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  tagContainer: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  tagText: { color: '#0056b3', fontSize: 12, fontWeight: '600' },
  dateText: { color: '#888', fontSize: 12 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  descriptionText: { lineHeight: 22, color: '#444', marginBottom: 20, fontSize: 15 },
  card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 },
  cardLabel: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 5 },
  salaryText: { fontSize: 22, color: '#28a745', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  requirementText: { marginLeft: 10, color: '#444', fontSize: 15 },
  contactText: { marginLeft: 10, color: '#444', fontSize: 15 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' },
  applyButton: { backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center' },
  applyButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});