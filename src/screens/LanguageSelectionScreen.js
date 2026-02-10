import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';

export default function LanguageSelectionScreen({ navigation }) {
  const selectLanguage = (lang) => {
    console.log("Language Selected:", lang);
    navigation.navigate('ModeSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subTitle}>زبان منتخب کریں</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => selectLanguage('Urdu')}>
            <Image 
              source={require('../assets/Flag_of_Pakistan.svg.png')} 
              style={styles.flag} 
              resizeMode="contain"
            />
            <Text style={styles.cardText}>اردو</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => selectLanguage('English')}>
            <Image 
              source={require('../assets/Flag_of_the_United_Kingdom.png')} 
              style={styles.flag} 
              resizeMode="contain"
            />
            <Text style={styles.cardText}>English</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
// ... (use the styles you already have)

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  subTitle: { 
    fontSize: 22, 
    color: '#666', 
    marginBottom: 40,
    marginTop: 5 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    width: '100%',
    gap: 20 
  },
  card: { 
    padding: 25, 
    borderWidth: 2, 
    borderColor: '#eee', 
    borderRadius: 20, 
    alignItems: 'center', 
    width: 150,
    backgroundColor: '#fdfdfd',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flag: { 
    width: 80, 
    height: 50, 
    marginBottom: 15 
  },
  cardText: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#0056b3' 
  },
  skipBtn: {
    marginTop: 60,
    backgroundColor: '#0056b3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  skipText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});