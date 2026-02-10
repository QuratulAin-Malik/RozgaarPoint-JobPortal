import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, List, UserCheck } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';

const BottomNav = ({ activeTab, onTabChange, lang }) => {
  const t = TRANSLATIONS[lang];
  const navItems = [
    { id: 'home', icon: Home, label: t.navHome },
    { id: 'activity', icon: List, label: t.navActivity },
    { id: 'profile', icon: UserCheck, label: t.navProfile },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onTabChange(item.id)}
          style={styles.navItem}
        >
          <item.icon 
            size={24}
            color={activeTab === item.id ? COLORS.primary : "#9CA3AF"}
            strokeWidth={2}
          />
          <Text style={[styles.navLabel, { color: activeTab === item.id ? COLORS.primary : "#9CA3AF" }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Styles defined within the file (Inline/Internal)
const styles = StyleSheet.create({
  bottomNav: { 
    flexDirection: 'row', 
    height: 70, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderColor: COLORS.border, 
    alignItems: 'center', 
    justifyContent: 'space-around' 
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 8 
  },
  navLabel: { 
    fontSize: 10, 
    marginTop: 4, 
    fontWeight: '500' 
  }
});

export default BottomNav;