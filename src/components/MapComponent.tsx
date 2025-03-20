"use client";

import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { useEffect, useRef } from "react";
import "ol/ol.css";
import { islandConfig, islandNames, markerLayer } from "@/lib/utils";

export default function MapComponent({
	island,
}: {
	island: islandNames;
}) {
	const mapContainer = useRef(null);

	useEffect(() => {
		const extent = islandConfig[island].size;
		const map = new Map({
			layers: [
				new ImageLayer({
					source: new Static({
						url: `/images/${island}.png`,
						imageExtent: extent,
						interpolate: false,
					}),
				}),
			],
			view: new View({
				center: [extent[2]/2, extent[3]/2],
				zoom: 2.25,
				extent: extent,
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
