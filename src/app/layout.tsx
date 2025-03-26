import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://radar.themysterys.com"),
	title: "Radar",
	description: "A map for finding fishing spots easily on MCC Island",
	icons: {
		icon: "/icon.png",
	},
	openGraph: {
		images: "/icon.png",
		type: "website",
	},
	twitter: {
		card: "summary",
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
