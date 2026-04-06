import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VitalPulseProps {
  color: string;
  duration?: number;
  backgroundColor?: string;
}

/**
 * VitalPulse - Componente que simula a onda de um monitor ECG/Batimentos.
 * A animação desliza da esquerda para a direita de forma contínua.
 */
export function VitalPulse({ color, duration = 3000, backgroundColor = '#0C1526' }: VitalPulseProps) {
  // scrollPos controla a transição de um ciclo (H1 + H2 = 200px)
  const scrollPos = useSharedValue(-200);

  useEffect(() => {
    // Esquerda para Direita: anima de -200px para 0px
    scrollPos.value = withRepeat(
      withTiming(0, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollPos.value }],
  }));

  // Padrão 1 e 2 de batimentos cardíacos
  const p1 = "M0 20 L20 20 L24 16 L28 20 L32 20 L35 25 L40 5 L45 35 L50 20 L55 20 L62 14 L70 20 L100 20";
  const p2 = "M100 20 L115 20 L118 10 L122 30 L126 20 L132 20 L135 2 L140 38 L145 20 L160 20 L170 14 L180 20 L200 20";
  const fullPath = `${p1} ${p2}`; // Ciclo de 200px

  return (
    <View style={styles.container}>
      {/* Container animado com três instâncias do ciclo para loop perfeito */}
      <Animated.View style={[styles.scrollContainer, animatedStyle]}>
        <Svg width="600" height="40" viewBox="0 0 600 40">
          <Path 
            d={fullPath} 
            stroke={color} 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <Path 
            d={fullPath} 
            x="200"
            stroke={color} 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <Path 
            d={fullPath} 
            x="400"
            stroke={color} 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </Svg>
      </Animated.View>

      {/* Gradientes de desvanecimento nas bordas para o efeito de "visor" */}
      <LinearGradient
        colors={[backgroundColor, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.15, y: 0 }}
        style={styles.fadeLeft}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', backgroundColor]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fadeRight}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 40,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  scrollContainer: {
    width: 600,
    height: 40,
    flexDirection: 'row',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    zIndex: 2,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    zIndex: 2,
  },
});
