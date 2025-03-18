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
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [spots, setSpots] = useState({
		temperate_1: [],
		temperate_2: [],
		temperate_3: [],
		tropical_1: [],
		tropical_2: [],
		tropical_3: [],
		barren_1: [],
		barren_2: [],
		barren_3: [],
	});

	useEffect(() => {
		const sourceURL = process.env.API_URL || "http://localhost:8879/spots";
		const eventSource = new EventSource(sourceURL);

		// TypeScript infers the data type as string from the EventSource object
		eventSource.onmessage = function (event) {
			// Parse the event data (which is a stringified JSON)
			const data = JSON.parse(event.data);
			setSpots(data);
		};

		// Optional: Handle errors
		eventSource.onerror = (error) => {
			console.warn("EventSource failed:", error);
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
							color: "white",
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
			</div>
			<dialog id="filterMenu" open={filterMenuOpen} className="relative z-10 bg-black p-3 text-white backdrop:bg-gray-700 backdrop:bg-opacity-70" >
				<div className="flex flex-col gap-5">
					<h1>Filter Menu</h1>
					<div><h3>Hooks</h3></div>
					<div><h3>Magnets</h3></div>
					<div>
						<h3>Special</h3>
						<div className="flex gap-2">
							<button className="p-2 bg-slate-500 rounded-lg enabled:bg-slate-700">Elusive Chance</button>
							<button className="p-2 bg-slate-500 rounded-lg enabled:bg-slate-700">Wayfind Data</button>
							<button className="p-2 bg-slate-500 rounded-lg enabled:bg-slate-700">Pearl Chance</button>

						</div>
					</div>
					<button className="bg-slate-800 p-1 rounded-lg border-2 border-slate-700 hover:bg-slate-700" onClick={() => {
						document.getElementById("filterMenu").close()
					}}>Close</button>
				</div>
			</dialog>
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
						<option value="tropical_1">Tropical Overgrowth</option>
						<option value="tropical_2">Coral Shores</option>
						<option value="tropical_3">Twisted Swamp</option>
						<option value="barren_1">Ancient Sands</option>
						<option value="barren_2">Blazing Canyon</option>
						<option value="barren_3">Ashen Wastes</option>
					</select>
					<hr className="-mx-2 my-2 border-gray-600 p-0" />
					<div className="flex justify-between">
						<h2 className="mr-4 mt-2 text-2xl font-semibold">
							Spots
						</h2>
						<div>
							<button className="bg-slate-800 p-2 rounded-lg border-2 border-slate-700 hover:bg-slate-700" onClick={() => {
								document.getElementById("filterMenu").showModal()
							}}>Filter Menu</button>
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
