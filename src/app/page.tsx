"use client";
import FilterMenu from "@/components/FilterMenu";
import MapComponent from "@/components/MapComponent";
import {
	addMarker,
	clearMarkers,
	Filter,
	filterFishingSpots,
	FishingSpot,
	formatPerks,
	islandConfig,
	islandNames,
	perkColors,
} from "@/lib/utils";
import { Feature } from "ol";
import { Circle } from "ol/geom";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect, useState } from "react";

export default function Home() {
	const [island, setIsland] = useState<islandNames>("temperate_1");
	const [selectedFilters, setSelectedFilters] = useState<Filter>({
		hooks: {
			strong: "0",
			wise: "0",
			glimmering: "0",
			greedy: "0",
			lucky: "0",
		},
		magnets: { xp: "0", fish: "0", pearl: "0", treasure: "0", spirit: "0" },
		lures: {
			strong: "0",
			wise: "0",
			glimmering: "0",
			greedy: "0",
			lucky: "0",
		},
	});
	const [spots, setSpots] = useState<{ [k: string]: FishingSpot[] }>({
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

	const [filteredSpots, setFilteredSpots] = useState<FishingSpot[]>([]);

	function addSpot(data: { island: islandNames; spot: FishingSpot }) {
		if (spots[data.island]) {
			setSpots((prevSpots) => ({
				...prevSpots,
				[data.island]: [...prevSpots[data.island], data.spot],
			}));
		} else {
			console.warn(`Category "${data.island}" does not exist.`);
		}
	}

	useEffect(() => {
		const sourceURL = process.env.API_URL || "http://localhost:8879/spots";
		const eventSource = new EventSource(sourceURL);

		let firstLoad = false;
		// TypeScript infers the data type as string from the EventSource object
		eventSource.onmessage = function (event) {
			// Parse the event data (which is a stringified JSON)
			const data = JSON.parse(event.data);
			if (!firstLoad) {
				setSpots(data);
				firstLoad = true;
				return;
			}

			addSpot(data);
		};

		eventSource.addEventListener("CLEAR", (event) => {
			const data = JSON.parse(event.data);

			setSpots(data);
		});

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
		const newFilteredSpots = filterFishingSpots(
			spots[island],
			selectedFilters
		);
		clearMarkers();
		if (newFilteredSpots.length > 0) {
			newFilteredSpots.map((spot) => {
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
					fishingSpot: spot
				});

				marker.setStyle(
					new Style({
						fill: new Fill({
							color: perkColors[spot.color],
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
		setFilteredSpots(newFilteredSpots);
	}, [selectedFilters, spots, island]);

	return (
		<main className="h-dvh flex flex-col">
			<div
				id="nav"
				className="my-2 ml-4 flex space-x-2 text-xl font-semibold"
			>
				<img src="/icon.png" className="w-7 h-7 " />
				<h1>Radar</h1>
			</div>
			<dialog
				id="filterMenu"
				className="bg-black p-3 text-white rounded-lg backdrop:bg-gray-700 backdrop:bg-opacity-70 space-y-2"
			>
				<FilterMenu
					selectedFilters={selectedFilters}
					setSelectedFilters={setSelectedFilters}
				/>
				<button
					className="bg-slate-800 p-1 rounded-lg border-2 border-slate-700 hover:bg-slate-700"
					onClick={() => {
						const modal = document.getElementById(
							"filterMenu"
						) as HTMLDialogElement;
						modal.close();
					}}
				>
					Close
				</button>
			</dialog>
			<div id="content" className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
				<MapComponent island={island} />
				<div
					id="list"
					className="mt-4 flex w-full flex-col px-4 text-xl md:mt-0 md:w-96"
				>
					<select
						className="w-full rounded-lg bg-slate-800 p-2"
						value={island}
						onChange={(e) =>
							setIsland(e.target.value as islandNames)
						}
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
					<hr className="-mx-4 my-2 border-gray-600 p-0" />
					<div className="flex justify-between">
						<h2 className="mr-4 mt-2 text-2xl font-semibold">
							Spots
						</h2>
						<div>
							<button
								className="bg-slate-800 p-2 rounded-lg border-2 border-slate-700 hover:bg-slate-700"
								onClick={() => {
									const modal = document.getElementById(
										"filterMenu"
									) as HTMLDialogElement;
									modal.showModal();
								}}
							>
								Filter Menu
							</button>
						</div>
					</div>
					<p>Total Spots on Island: {spots[island].length}</p>
					<div
						id="spots"
						className="flex-1 overflow-y-auto mt-4 space-y-2 pr-3 -mr-3"
					>
							{filteredSpots.map((spot, i) => {
								return (
									<div
										key={i}
										className="border-2 rounded-lg p-2"
									>
										<p>Cords: {spot.cords}</p>
										<p>Perks: {formatPerks(spot)}</p>
										<p>
											Found by: {spot.foundBy ?? "Hidden"}
										</p>
									</div>
								);
							})}
					</div>
				</div>
			</div>
		</main>
	);
}
