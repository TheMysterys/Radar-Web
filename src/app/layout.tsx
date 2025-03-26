import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Radar",
	description: "A map for finding fishing spots easily on MCC Island",
	icons: {
		icon: "/icon.png"
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
