import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
	title: string; // "Memo"
	meta: string; // "12 Memo"
	icon: React.ComponentProps<typeof FontAwesome6>["name"];
	accent?: string; // warna utama (default navy)
	onPress?: () => void;
};

function withAlpha(hex: string, alpha = 0.15) {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function QuickStatCard({
	title,
	meta,
	icon,
	accent = Colors.navy,
	onPress,
}: Props) {
	return (
		<Pressable
			style={[styles.card, { borderColor: withAlpha(Colors.secondary, 0.9) }]}
			onPress={onPress}>
			<View
				style={[styles.iconWrap, { backgroundColor: withAlpha(accent, 0.2) }]}>
				<FontAwesome6 name={icon} size={22} color={accent} />
			</View>
			<Text
				style={[
					Fonts.header5,
					{ color: Colors.textPrimary, marginTop: 8, textTransform: "none" },
				]}>
				{title}
			</Text>
			<Text
				style={[Fonts.paragraphRegularSmall, { color: Colors.textSecondary }]}>
				{meta}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: Colors.white,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 12,
		borderWidth: 1,
		elevation: 0,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});
