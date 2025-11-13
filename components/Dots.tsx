import React from "react";
import { View } from "react-native";

type Props = {
	total: number;
	activeIndex: number; // 0-based
	size?: number; // diameter dot
	spacing?: number; // jarak antar dot
	color?: string; // warna aktif
	inactiveColor?: string; // warna non-aktif (biasanya dengan opacity)
};

export default function Dots({
	total,
	activeIndex,
	size = 10,
	spacing = 8,
	color = "#3D37A7", // biru / sesuaikan Colors.navy kalau mau
	inactiveColor = "rgba(0,0,0,0.15)",
}: Props) {
	return (
		<View
			style={{
				flexDirection: "row",
				gap: spacing,
				alignItems: "center",
				justifyContent: "center",
			}}>
			{Array.from({ length: total }).map((_, i) => {
				const active = i === activeIndex;
				return (
					<View
						key={i}
						style={{
							width: size,
							height: size,
							borderRadius: size / 2,
							backgroundColor: active ? color : inactiveColor,
							transform: [{ scale: active ? 1.1 : 1 }],
						}}
					/>
				);
			})}
		</View>
	);
}
