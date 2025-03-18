import { Feature } from "ol";
import { Circle } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const islandConfig = {
	temperate_1: {
		x: { min: -512, max: -1 },
		y: { min: 511, max: 0 },
		size: [0, 0, 512, 512]
	},
	temperate_2: {
		x: { min: 1536, max: 2047 },
		y: { min: 1023, max: 512 },
		size: [0, 0, 512, 512]
	},
	temperate_3: {
		x: { min: 1536, max: 2047 },
		y: { min: 2047, max: 1536 },
		size: [0, 0, 512, 512]
	},
	
	tropical_1: {
		x: { min: 512, max: 1023 },
		y: { min: 2047, max: 1427 },
		size: [0, 0, 512, 621]
	},
	
	tropical_2: {
		x: { min: -512, max: -1 },
		y: { min: 2047, max: 1536 },
		size: [0, 0, 512, 512]
	},
	
	tropical_3: {
		x: { min: 1536, max: 2047 },
		y: { min: -1, max: -512 },
		size: [0, 0, 512, 512]
	},
	
	barren_1: {
		x: { min: 2560, max: 3126 },
		y: { min: -1, max: -569 },
		size: [0, 0, 567, 569]
	},
	
	barren_2: {
		x: { min: 2560, max: 3071 },
		y: { min: 1535, max: 1024 },
		size: [0, 0, 512, 512]
	},
	
	barren_3: {
		x: { min: 1024, max: 1535 },
		y: { min: 3071, max: 2560 },
		size: [0, 0, 512, 512]
	},
} as const satisfies {
	[k: string]: {
		x: { min: number; max: number };
		y: { min: number; max: number };
		size: number[];
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
