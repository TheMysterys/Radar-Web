import { Feature } from "ol";
import { Circle } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const islandConfig = {
	temperate_1: {
		x: { min: -512, max: -1 },
		y: { min: 511, max: 0 },
	},
	temperate_2: {
		x: { min: 1536, max: 2047 },
		y: { min: 1023, max: 512 },
	},
	temperate_3: {
		x: { min: 1536, max: 2047 },
		y: { min: 2047, max: 1536 },
	},
} as const satisfies {
	[k: string]: {
		x: { min: number; max: number };
		y: { min: number; max: number };
	};
};

export type islandNames = keyof typeof islandConfig;

export const perkColors: { [k: string]: string } = {
	strong: "#fc5454",
	wise: "#2199f0",
	glimmering: "#8632fc",
	greedy: "#fc7d3f",
	lucky: "#23c525",
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
	markers.splice(0,markers.length);
	markerLayer.setSource(
		new VectorSource({
			features: markers,
		})
	);
}
