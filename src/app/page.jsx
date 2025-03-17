"use client";
import MapComponent from "@/components/MapComponent";
import { addMarker, clearMarkers, islandConfig, perkColors } from "@/lib/utils";
import { Feature } from "ol";
import { Circle } from "ol/geom";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect, useState } from "react";

export default function Home() {
	const [island, setIsland] = useState("temperate_1");
	const [spots, setSpots] = useState({
		temperate_1: [],
		temperate_2: [],
		temperate_3: [],
	});

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:8080/spots");

		// TypeScript infers the data type as string from the EventSource object
		eventSource.onmessage = function (event) {
			// Parse the event data (which is a stringified JSON)
			const data = JSON.parse(event.data);
			setSpots(data);
		};

		// Optional: Handle errors
		eventSource.onerror = (error) => {
			console.log("EventSource failed:", error);
		};

		// Close connection when the component is unmounted
		return () => {
			eventSource.close();
		};
	}, []);

	useEffect(() => {
		clearMarkers();
		if (spots[island].length > 0) {
			spots[island].map((spot) => {
				const xOffset = islandConfig[island].x.min;
				const zOffset = islandConfig[island].y.min;

				const [spotX, spotZ] = spot.cords
					.split("/")
					.map((c) => parseInt(c));

				const x = spotX - xOffset;
				const z = zOffset - spotZ;

				const marker = new Feature({
					geometry: new Circle([x, z], 2.5),
					name: "Fishing Spot",
					foundBy: spot.foundBy,
					perks: spot.perks,
					cords: spot.cords,
				});

				marker.setStyle(
					new Style({
						fill: new Fill({
							color: perkColors[
								spot.perks[0].split(" ")[1].toLowerCase()
							],
						}),
						stroke: new Stroke({
							color: 'white',
							width: 2,
						  }),
					})
				);

				addMarker(marker);
			});
		}
	}, [spots, island]);

	return (
		<>
			<div
				id="nav"
				className="my-2 ml-4 flex space-x-2 text-xl font-semibold"
			>
				<h1>FishyMap</h1>
				<h1>
					<a href="/about">About</a>
				</h1>
			</div>
			<div id="content" className="grid-cols-4 md:grid">
				<MapComponent island={island} />
				<div id="list" className="mt-4 px-2 text-xl md:mt-0">
					<select
						className="w-full rounded-lg bg-slate-800 p-2"
						value={island}
						onChange={(e) => setIsland(e.target.value)}
					>
						<option value="temperate_1">Verdant Woods</option>
						<option value="temperate_2">Floral Forest</option>
						<option value="temperate_3">Dark Grove</option>
					</select>
					<hr className="-mx-2 my-2 border-gray-600 p-0" />
					<div className="flex justify-between">
						<h2 className="mr-4 mt-2 text-2xl font-semibold">
							Spots
						</h2>
						<div>
							<label htmlFor="filter" className="mt-2 text-lg">
								Filter Hooks:
							</label>
							<select
								id="filter"
								className="rounded-lg bg-slate-800 p-2"
							>
								<option value="all">All</option>
								<option value="strong">Strong Hook</option>
								<option value="wise">Wise Hook</option>
								<option value="glimmering">
									Glimmering Hook
								</option>
								<option value="greedy">Greedy Hook</option>
								<option value="lucky">Lucky Hook</option>
							</select>
						</div>
					</div>
					<div id="spots" className="flex flex-col mt-2 gap-y-2">
						<span>Total Spots: {spots[island].length}</span>
						{spots[island].map((spot, i) => {
							return (
								<div
									key={i}
									className="border-2 rounded-lg p-2"
								>
									<p>Cords: {spot.cords}</p>
									<p>Perks: {spot.perks}</p>
									<p>Found by: {spot.foundBy ?? "Hidden"}</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}
