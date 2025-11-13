/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, StyleSheet } from "react-native";

const tintColorLight = "#0a7ea4";

export const Colors = {
	light: {
		text: "#11181C",
		background: "#fff",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
	},
	dark: {
		text: "#11181C",
		background: "#fff",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
	},
};

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded:
			"'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});

// Styles khusus untuk halaman index dokumen
export const stylesIndex = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	header: { padding: 20 },
	title: { fontSize: 22, fontWeight: "bold", color: "#000" },
	subtitle: { fontSize: 16, color: "gray", marginTop: 4 },
	list: { paddingHorizontal: 16, paddingBottom: 100 },
	card: { borderRadius: 10, padding: 12, marginVertical: 6 },
	row: { flexDirection: "row", alignItems: "center" },
	icon: { marginRight: 12 },
	cardTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
	cardDate: { fontSize: 14, color: "gray", marginTop: 2 },
	link: { color: "#007bff", fontSize: 14, fontWeight: "500" },
	bottomNav: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 12,
		borderTopWidth: 1,
		borderColor: "#eee",
		backgroundColor: "#fff",
		position: "absolute",
		bottom: 0,
		width: "100%",
	},
});
