"use client";

import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { useEffect, useRef } from "react";
import "ol/ol.css";
import { islandNames, markerLayer } from "@/lib/utils";

export default function MapComponent({
	island,
}: {
	island: islandNames;
	spots: [{ cords: string; players: object[]; perks: string[] }];
}) {
	const mapContainer = useRef(null);

	useEffect(() => {
		const map = new Map({
			layers: [
				new ImageLayer({
					source: new Static({
						url: `/images/${island}.png`,
						imageExtent: [0, 0, 512, 512],
						interpolate: false,
					}),
				}),
			],
			view: new View({
				center: [256, 256],
				zoom: 2.25,
				extent: [0, 0, 512, 512],
			}),
			pixelRatio: 1,
		});

		map.addLayer(markerLayer);

		map.setTarget(mapContainer.current!);
		return () => map.setTarget(undefined);
	}, [island]);

	return (
		<>
			<div ref={mapContainer} className="map col-span-3 mx-4 md:mx-0" />
		</>
	);
}
