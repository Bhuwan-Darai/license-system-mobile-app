import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";
import { useQueryCarousels } from "@/hooks/mobile/useMobileContent";

const SIDE_PADDING = 20; // matches the home screen's horizontal padding
const AUTO_SLIDE_MS = 4000;
const HEIGHT = 160;

// Slides the admin marked as displayed, auto-advancing, with page dots.
export default function HomeCarousel() {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - SIDE_PADDING * 2;
  const { data } = useQueryCarousels();
  const slides = data ?? [];

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;
  const dragging = useRef(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      if (dragging.current) return;
      const next = (indexRef.current + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length, width]);

  if (slides.length === 0) return null;

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    dragging.current = false;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => (dragging.current = true)}
        onMomentumScrollEnd={onEnd}
        style={{ width }}
      >
        {slides.map((s) => {
          const canOpen = /^https?:\/\//.test(s.link);
          return (
            <TouchableOpacity
              key={s.carousel_id}
              activeOpacity={canOpen ? 0.85 : 1}
              disabled={!canOpen}
              onPress={() => Linking.openURL(s.link)}
              style={[styles.slide, { width }]}
            >
              {s.image ? (
                <Image source={{ uri: s.image }} style={styles.image} resizeMode="cover" />
              ) : null}
              {s.title || s.description ? (
                <View style={styles.caption}>
                  {s.title ? <Text style={styles.title}>{s.title}</Text> : null}
                  {s.description ? (
                    <Text style={styles.desc} numberOfLines={2}>
                      {s.description}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.carousel_id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  slide: {
    height: HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: BrandColors.himalaya,
  },
  image: { ...StyleSheet.absoluteFillObject },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  title: { color: "#fff", fontSize: 14, fontWeight: "700" },
  desc: { color: "#fff", fontSize: 12, opacity: 0.9, marginTop: 2 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BrandColors.line },
  dotActive: { backgroundColor: BrandColors.crimson, width: 16 },
});
