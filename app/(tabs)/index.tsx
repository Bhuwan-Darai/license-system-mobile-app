import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useRouter} from "expo-router";
import {useAuth} from "@/context/auth";
import {BrandColors} from "@/constants/theme";
import HomeCarousel from "@/components/Home/HomeCarousel";
import FuelPrices from "@/components/Home/FuelPrices";
import {Card, PageHeader, SectionHeader, Space, Tag} from "@/components/ui/kit";
import {useQueryNews} from "@/hooks/mobile/useMobileContent";

const QUICK_LINKS = [
    {label: "Practice MCQ", hint: "Question sets", route: "/(tabs)/practice"},
    {label: "My attempts", hint: "Past results", route: "/practice/history"},
    {label: "Traffic signs", hint: "Symbols and meanings", route: "/more/signs"},
    {label: "Ishihara plates", hint: "Colour vision test", route: "/more/ishihara"},
    {label: "Driving schools", hint: "Near you", route: "/more/driving-schools"},
    {label: "License status", hint: "Check your license", route: "/more/status"},
    {label: "Mileage", hint: "Calculator", route: "/more/mileage-calculator"},
    {label: "Fuel cost", hint: "Calculator", route: "/more/fuel-calculator"},
];

const tagLabel = (tag: string) => tag.charAt(0) + tag.slice(1).toLowerCase();

export default function HomeDashboard() {
    const router = useRouter();
    const {user} = useAuth();

    const {data: latestNews} = useQueryNews(undefined, 5);
    const news = latestNews ?? [];

    return (
        <View style={styles.container}>
            <PageHeader title={user?.name || user?.email || "Home"} subtitle="Welcome back"/>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Carousel (shown only when the admin has displayed slides) */}
                <HomeCarousel/>

                <View style={styles.grid}>
                    {QUICK_LINKS.map((link) => (
                        <Card
                            key={link.route}
                            style={styles.tile}
                            onPress={() => router.push(link.route as any)}
                        >
                            <Text style={styles.tileLabel}>{link.label}</Text>
                            <Text style={styles.tileHint}>{link.hint}</Text>
                        </Card>
                    ))}
                </View>

                <FuelPrices/>

                {news.length > 0 ? (
                    <View>
                        <SectionHeader
                            title="Latest news"
                            action="See all"
                            onAction={() => router.push("/(tabs)/news")}
                        />
                        <View style={{gap: 10}}>
                            {news.map((n) => (
                                <Card key={n.news_id} onPress={() => router.push("/(tabs)/news")}>
                                    <Tag label={tagLabel(n.tag)}/>
                                    <Text style={styles.newsTitle}>{n.title}</Text>
                                    <Text style={styles.newsDesc} numberOfLines={2}>
                                        {n.content}
                                    </Text>
                                </Card>
                            ))}
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: BrandColors.paper},
    content: {paddingHorizontal: Space.page, paddingBottom: 40},
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 26,
    },
    tile: {width: "48.5%", paddingVertical: 16},
    tileLabel: {fontSize: 14.5, fontWeight: "600", color: BrandColors.ink},
    tileHint: {fontSize: 12.5, color: BrandColors.inkSoft, marginTop: 3},
    newsTitle: {fontSize: 15, fontWeight: "600", color: BrandColors.ink, marginTop: 8},
    newsDesc: {fontSize: 13, color: BrandColors.inkSoft, lineHeight: 18, marginTop: 4},
});
