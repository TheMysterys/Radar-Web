"use client";

import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { useEffect, useRef } from "react";
import "ol/ol.css";
import { FishingSpot, formatPerks, islandConfig, islandNames, markerLayer, perkColors } from "@/lib/utils";
import { FeatureLike } from "ol/Feature";
import { Pixel } from "ol/pixel";

export default function MapComponent({ island }: { island: islandNames }) {
	const mapContainer = useRef(null);

	useEffect(() => {
		const info = document.getElementById("info");

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
				center: [extent[2] / 2, extent[3] / 2],
				zoom: 2.25,
				extent: extent,
			}),
			pixelRatio: 1,
		});

		map.addLayer(markerLayer);

		let currentFeature: FeatureLike | undefined;
		const displayFeatureInfo = function (pixel: Pixel, target: any) {
			const feature = target.closest(".ol-control")
				? undefined
				: map.forEachFeatureAtPixel(pixel, function (feature) {
						return feature;
				  });
			if (feature) {
				info!.style.left = pixel[0]+10 + "px";
				info!.style.top = pixel[1] + "px";
				if (feature !== currentFeature) {
					info!.style.visibility = "visible";
					const spot: FishingSpot = feature.get("fishingSpot")
					info!.innerText = [
						`Cords: ${spot.cords}`,
						`Perks: ${formatPerks(spot)}`,
						`Found By: ${spot.foundBy}`
					].join("\n");
					info!.style.borderColor = perkColors[spot.color]
				}
			} else {
				info!.style.visibility = "hidden";
			}
			currentFeature = feature;
		};

		map.on('pointermove', function (evt) {
			if (evt.dragging) {
			  info!.style.visibility = 'hidden';
			  currentFeature = undefined;
			  return;
			}
			displayFeatureInfo(evt.pixel, evt.originalEvent.target);
		  });
		  
		  map.on('click', function (evt) {
			displayFeatureInfo(evt.pixel, evt.originalEvent.target);
		  });

		map.setTarget(mapContainer.current!);
		return () => map.setTarget(undefined);
	}, [island]);

	return (
		<>
			<div
				ref={mapContainer}
				className="map md:flex-1 h-96 md:h-full mx-4 md:mx-0"
			>
				<div id="info" />
			</div>
		</>
	);
}
