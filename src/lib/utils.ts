import { Feature } from "ol";
import { Circle } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const islandConfig = {
	temperate_1: {
		x: { min: -512, max: -1 },
		y: { min: 511, max: 0 },
		size: [0, 0, 512, 512],
	},
	temperate_2: {
		x: { min: 1536, max: 2047 },
		y: { min: 1023, max: 512 },
		size: [0, 0, 512, 512],
	},
	temperate_3: {
		x: { min: 1536, max: 2047 },
		y: { min: 2047, max: 1536 },
		size: [0, 0, 512, 512],
	},

	tropical_1: {
		x: { min: 512, max: 1023 },
		y: { min: 2047, max: 1427 },
		size: [0, 0, 512, 621],
	},

	tropical_2: {
		x: { min: -512, max: -1 },
		y: { min: 2047, max: 1536 },
		size: [0, 0, 512, 512],
	},

	tropical_3: {
		x: { min: 1536, max: 2047 },
		y: { min: -1, max: -512 },
		size: [0, 0, 512, 512],
	},

	barren_1: {
		x: { min: 2560, max: 3126 },
		y: { min: -1, max: -569 },
		size: [0, 0, 567, 569],
	},

	barren_2: {
		x: { min: 2560, max: 3071 },
		y: { min: 1535, max: 1024 },
		size: [0, 0, 512, 512],
	},

	barren_3: {
		x: { min: 1024, max: 1535 },
		y: { min: 3071, max: 2560 },
		size: [0, 0, 512, 512],
	},
} as const satisfies {
	[k: string]: {
		x: { min: number; max: number };
		y: { min: number; max: number };
		size: number[];
	};
};

export type IslandNames = keyof typeof islandConfig;

export const perkColors: { [k: string]: string } = {
	strong: "#fc5454",
	wise: "#2199f0",
	glimmering: "#8632fc",
	greedy: "#f27500",
	lucky: "#23c525",
};

export type Filter = {
	category: string;
	type: string;
	amount: string | null;
};

export type FishingSpot = {
	cords: string;
	foundBy: string | null;
	color: string;
	perks: {
		hooks?: {
			strong?: string;
			wise?: string;
			glimmering?: string;
			greedy?: string;
			lucky?: string;
		};
		magnets?: {
			xp?: string;
			fish?: string;
			pearl?: string;
			treasure?: string;
			spirit?: string;
		};
		lures?: {
			strong?: string;
			wise?: string;
			glimmering?: string;
			greedy?: string;
			lucky?: string;
		};
	};
};

const markers: Feature<Circle>[] = [];

export const markerLayer = new VectorLayer({
	source: new VectorSource({
		features: markers,
	}),
});

export function addMarker(marker: Feature<Circle>) {
	markers.push(marker);

	markerLayer.setSource(
		new VectorSource({
			features: markers,
		})
	);
}

export function clearMarkers() {
	markers.splice(0, markers.length);
	markerLayer.setSource(
		new VectorSource({
			features: markers,
		})
	);
}

export function filterFishingSpots(
	spots: FishingSpot[],
	selectedFilters: Filter[],
	enforce: boolean
): FishingSpot[] {
	if (selectedFilters.length === 0) return spots;

	return spots.filter((spot) =>
		matchesFilter(spot, selectedFilters, enforce)
	);
}

function matchesFilter(
	spot: FishingSpot,
	selectedFilters: Filter[],
	enforce: boolean
): boolean {
	if (enforce) {
		return selectedFilters.every((filter) => {
			const { category, type, amount } = filter;

			const categoryPerk = (spot.perks as any)[category];
			if (!categoryPerk) return false;

			const perkValue = categoryPerk[type];
			if (!perkValue) return false;

			return amount === null || perkValue >= amount;
		});
	}
	for (const filter of selectedFilters) {
		const { category, type, amount } = filter;

		// Access the specific perks category (hooks, magnets, or lures)
		const categoryPerk = (spot.perks as any)[category];

		// Skip if the category doesn't exist
		if (!categoryPerk) continue;

		// Access the specific perk type
		const perkValue = categoryPerk[type];

		// If the perk exists and either no amount is required or amount matches
		if (perkValue && (amount === null || perkValue >= amount)) {
			return true;
		}
	}

	return false;
}
export const capitalize = (word: string) =>
	word.charAt(0).toUpperCase() + word.slice(1);

export function renamePerks(type: string, category: string) {
	// Lures mapping
	const lureMappings: { [key: string]: string } = {
		strong: "Elusive Fish Chance",
		wise: "Wayfinder Data",
		glimmering: "Pearl Chance",
		greedy: "Treasure Chance",
		lucky: "Spirit Chance",
	};

	if (category === "lures") return lureMappings[type];
	else return `${capitalize(type)} ${capitalize(category).replace(/s+$/, '')} `;
}

export function formatPerks(fishingSpot: FishingSpot) {
	const perks = fishingSpot.perks;
	let perkStrings: string[] = [];

	// Lures mapping
	const lureMappings: { [key: string]: string } = {
		strong: "Elusive Fish Chance",
		wise: "Wayfinder Data",
		glimmering: "Pearl Chance",
		greedy: "Treasure Chance",
		lucky: "Spirit Chance",
	};

	// Iterate over all perk categories (hooks, magnets, lures)
	for (const category in perks) {
		const categoryData = perks[category as keyof typeof perks];

		if (categoryData) {
			// Capitalize category name and strip the "s"
			const formattedCategory =
				category.charAt(0).toUpperCase() +
				category.slice(1).replace(/s$/, "");

			// Iterate over all types in a given category
			for (const perkType in categoryData) {
				const amount =
					categoryData[perkType as keyof typeof categoryData];
				if (amount) {
					// For lures, map the perk types to their custom names
					let formattedPerkType =
						perkType.charAt(0).toUpperCase() + perkType.slice(1);
					if (category === "lures" && lureMappings[perkType]) {
						formattedPerkType = lureMappings[perkType]; // Map to custom names for lures
					}

					// Format the perk string
					if (category === "lures") {
						if (perkType == "wise") {
							perkStrings.push(`+${amount} ${formattedPerkType}`);
						} else {
							perkStrings.push(
								`+${amount}% ${formattedPerkType}`
							);
						}
					} else {
						perkStrings.push(
							`+${amount}% ${formattedPerkType} ${formattedCategory}`
						);
					}
				}
			}
		}
	}

	return perkStrings.join(", ");
}
