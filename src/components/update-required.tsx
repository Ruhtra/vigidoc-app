import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { NavColorsDark } from '@constants/nav-theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MonitorUp, ShieldAlert, Rocket } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface UpdateRequiredScreenProps {
  storeUrl: string;
}

export const UpdateRequiredScreen: React.FC<UpdateRequiredScreenProps> = ({ storeUrl }) => {
  const handleUpdate = () => {
    Linking.openURL(storeUrl);
  };

  return (
    <View style={styles.container}>
      {/* Detalhes de Fundo Cybernéticos */}
      <View style={styles.backgroundPatterns}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      <Animated.View 
        entering={FadeInDown.duration(800).springify()}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <View style={styles.glow} />
          <Rocket size={48} color={NavColorsDark.cyan} />
        </View>

        <Text style={styles.title}>NOVA VERSÃO DISPONÍVEL</Text>
        
        <Text style={styles.description}>
          Para garantir sua segurança e acesso às novas funcionalidades clínicas, a atualização do Vigidoc é obrigatória.
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ShieldAlert size={16} color={NavColorsDark.violet} />
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[NavColorsDark.cyan, NavColorsDark.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>ATUALIZAR AGORA</Text>
            <MonitorUp size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>VigiDoc Protocol - Securing Healthcare</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NavColorsDark.bg0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backgroundPatterns: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: NavColorsDark.cyan,
    borderWidth: 2,
  },
  topLeft: { top: 60, left: 24, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 60, right: 24, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 60, left: 24, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 60, right: 24, borderLeftWidth: 0, borderTopWidth: 0 },
  
  card: {
    width: '100%',
    padding: 32,
    backgroundColor: NavColorsDark.bg2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    shadowColor: NavColorsDark.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: NavColorsDark.cyan,
    borderRadius: 50,
    opacity: 0.1,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  description: {
    color: NavColorsDark.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 24,
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
