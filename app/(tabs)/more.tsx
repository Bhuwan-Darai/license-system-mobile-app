import {BrandColors} from "@/constants/theme";
import {useAuth} from "@/context/auth";
import {ListGroup, ListRow, PageHeader, Space} from "@/components/ui/kit";
import {useRouter} from "expo-router";
import React from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";

type Item = {label: string; route: string};

const SECTIONS: {title: string; items: Item[]}[] = [
    {
        title: "Learn",
        items: [
            {label: "Blog and guides", route: "/more/blog"},
            {label: "Traffic symbols", route: "/more/signs"},
            {label: "Ishihara plates", route: "/more/ishihara"},
        ],
    },
    {
        title: "Tools",
        items: [
            {label: "Driving schools", route: "/more/driving-schools"},
            {label: "Mileage calculator", route: "/more/mileage-calculator"},
            {label: "Fuel calculator", route: "/more/fuel-calculator"},
        ],
    },
    {
        title: "Information",
        items: [
            {label: "License status", route: "/more/status"},
            {label: "Bus fare list", route: "/more/busfare"},
            {label: "Emergency numbers", route: "/more/emergency"},
        ],
    },
    {
        title: "About",
        items: [
            {label: "Policies", route: "/more/policies"},
            {label: "About us", route: "/more/about-us"},
        ],
    },
];

export default function MoreScreen() {
    const router = useRouter();
    const {signOut} = useAuth();

    return (
        <View style={styles.container}>
            <PageHeader title="More" bell={false}/>
            <ScrollView contentContainerStyle={styles.content}>
                {SECTIONS.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionLabel}>{section.title}</Text>
                        <ListGroup>
                            {section.items.map((item) => (
                                <ListRow
                                    key={item.route}
                                    title={item.label}
                                    onPress={() => router.push(item.route as any)}
                                />
                            ))}
                        </ListGroup>
                    </View>
                ))}

                <ListGroup>
                    <ListRow title="Log out" destructive chevron={false} onPress={() => signOut()}/>
                </ListGroup>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: BrandColors.paper},
    content: {paddingHorizontal: Space.page, paddingBottom: 40},
    section: {marginBottom: 22},
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: BrandColors.inkSoft,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 8,
        marginLeft: 4,
    },
});
