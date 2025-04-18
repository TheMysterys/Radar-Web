"use client";

import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { useEffect, useRef } from "react";
import "ol/ol.css";
import {
	FishingSpot,
	formatPerks,
	islandConfig,
	IslandNames,
	markerLayer,
	perkColors,
} from "@/lib/utils";
import { FeatureLike } from "ol/Feature";
import { Pixel } from "ol/pixel";

export default function MapComponent({ island }: { island: IslandNames }) {
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
				const mapSize = map.getSize();
				if (!mapSize) return;

				const mapRect = map.getTargetElement().getBoundingClientRect(); // Get map's viewport boundaries
				const viewportMidX = (mapRect.left + mapRect.right) / 2; // Midpoint of the visible viewport
				const featureCoord = map.getCoordinateFromPixel(pixel); // Get feature coordinate
				const isRightSide = featureCoord[0] > viewportMidX;

				const extraPadding = 15; // Extra padding to ensure tooltip doesn't touch the right edge
				let tooltipX =
					pixel[0] +
					(isRightSide ? -10 - info!.offsetWidth - extraPadding : 10); // Shift left if needed
				let tooltipY = pixel[1] + 10; // Default below cursor

				// Ensure tooltip stays within the map viewport
				const mapLeft = mapRect.left;
				const mapRight = mapRect.right;
				const mapTop = mapRect.top;
				const mapBottom = mapRect.bottom;
				const tooltipWidth = info!.offsetWidth;
				const tooltipHeight = info!.offsetHeight;

				// Prevent left overflow
				if (tooltipX + mapLeft < mapLeft) {
					tooltipX = 5; // Keep a small gap from the left
				}

				// Prevent right overflow
				if (tooltipX + tooltipWidth + mapLeft > mapRight) {
					tooltipX = mapRight - mapLeft - tooltipWidth - extraPadding; // Shift left more
				}

				// Prevent bottom overflow
				if (tooltipY + tooltipHeight + mapTop > mapBottom) {
					tooltipY = pixel[1] - tooltipHeight - 10; // Move above cursor
				}

				// Prevent top overflow
				if (tooltipY + mapTop < mapTop) {
					tooltipY = 5;
				}

				info!.style.left = `${tooltipX}px`;
				info!.style.top = `${tooltipY}px`;

				if (feature !== currentFeature) {
					info!.style.visibility = "visible";
					const spot: FishingSpot = feature.get("fishingSpot");
					info!.innerHTML = [
						`<p>Cords: ${spot.cords}</p>`,
						`<p>Perks: ${formatPerks(spot)}</p>`,
						`<p>Found By: ${spot.foundBy ?? "Hidden"}</p>`,
					].join("\n");
					info!.style.borderColor = perkColors[spot.color];
				}
			} else {
				info!.style.visibility = "hidden";
			}
			currentFeature = feature;
		};

		map.on("pointermove", function (evt) {
			if (evt.dragging) {
				info!.style.visibility = "hidden";
				currentFeature = undefined;
				return;
			}
			displayFeatureInfo(evt.pixel, evt.originalEvent.target);
		});

		map.on("click", function (evt) {
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
