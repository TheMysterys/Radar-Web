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
	highlightMarker,
	islandBackgroundColors,
	islandColors,
	islandConfig,
	IslandNames,
	islandNamesMapping,
	perkColors,
	unhighlightMarker,
} from "@/lib/utils";
import { Feature } from "ol";
import { Circle } from "ol/geom";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import ImageStyle from "ol/style/Image";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect, useState } from "react";

export default function Home() {
	const [island, setIsland] = useState<IslandNames>("temperate_1");
	const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);
	const [enforce, setEnforce] = useState(false);
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

	function addSpot(data: { island: IslandNames; spot: FishingSpot }) {
		if (spots[data.island]) {
			setSpots((prevSpots) => ({
				...prevSpots,
				[data.island]: [...prevSpots[data.island], data.spot],
			}));
		} else {
			console.warn(`Category "${data.island}" does not exist.`);
		}
	}

	// Fetch data from API

	const [connectionStatus, setConnectionStatus] = useState<
		"connected" | "reconnecting" | "failed" | "connecting"
	>("connecting");

	useEffect(() => {
		const sourceURL = process.env.API_URL || "http://localhost:8879/spots";

		let eventSource: EventSource | null = null;
		let reconnectTimeout: NodeJS.Timeout;
		let firstLoad = false;
		let reconnectAttempts = 0;
		const maxRetries = 5;
		const retryDelay = 3000; // 3 seconds

		const connect = () => {
			eventSource = new EventSource(sourceURL);

			eventSource.onopen = () => {
				setConnectionStatus("connected");
				reconnectAttempts = 0;
			};

			eventSource.onmessage = (event) => {
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

			eventSource.onerror = (err) => {
				console.warn("EventSource failed:", err);
				eventSource?.close();

				if (reconnectAttempts < maxRetries) {
					reconnectAttempts++;
					setConnectionStatus("reconnecting");

					reconnectTimeout = setTimeout(connect, retryDelay);
				} else {
					setConnectionStatus("failed");
				}
			};
		};

		connect(); // Initial connection

		return () => {
			eventSource?.close();
			clearTimeout(reconnectTimeout);
		};
	}, []);

	// Update markers on the map
	useEffect(() => {
		const newFilteredSpots = filterFishingSpots(
			spots[island],
			selectedFilters,
			enforce
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
					fishingSpot: spot,
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

				spot.marker = marker;
				addMarker(marker);
			});
		}
		setFilteredSpots(newFilteredSpots);
	}, [selectedFilters, spots, island, enforce]);

	// Persistent State for filter and enforce

	// Load state
	useEffect(() => {
		const storedFilters = window.localStorage.getItem("filter");
		const storedEnforce = window.localStorage.getItem("enforce");

		if (storedFilters) {
			setSelectedFilters(JSON.parse(storedFilters));
		}
		if (storedEnforce) {
			setEnforce(JSON.parse(storedEnforce));
		}
	}, []);

	// Save state
	useEffect(() => {
		localStorage.setItem("filter", JSON.stringify(selectedFilters));
		localStorage.setItem("enforce", JSON.stringify(enforce));
	}, [selectedFilters, enforce]);

	useEffect(() => {
		document.body.style.setProperty('--background', islandBackgroundColors[island]);
	}, [island])

	return (
		<main className="h-dvh flex flex-col">
			{connectionStatus === "connecting" && (
				<div className="absolute bottom-5 left-5 z-50 rounded-lg bg-green-400 p-2 text-lg font-bold text-black">
					Connecting to server...
				</div>
			)}

			{connectionStatus === "reconnecting" && (
				<div className="absolute bottom-5 left-5 z-50 rounded-lg bg-orange-400 p-2 text-lg font-bold text-black">
					Reconnecting to server...
				</div>
			)}

			{connectionStatus === "failed" && (
				<div className="absolute bottom-5 left-5 z-50 rounded-lg bg-red-400 p-2 text-lg font-bold text-black">
					Failed to connect to server.
				</div>
			)}
			
			<div
				id="nav"
				className="my-2 mx-4 flex space-x-2 text-xl font-semibold items-center justify-between"
			>
				<div className="flex gap-2 hidable-if-not-enough-space">
					<img src="/icon.png" className="w-7 h-7 " />
					<h1>Radar</h1>
				</div>
				<div className="islands-div">
					{["temperate_1","temperate_2","temperate_3",
						"tropical_1", "tropical_2", "tropical_3",
						"barren_1", "barren_2", "barren_3", 
					].map((type, i) => {
						let classes = "island-button"
						if (type == island) {
							classes = "island-button island-button-selected"
						}
						return(
							<input type="button"
								className={classes}
								style={{
									backgroundImage: `url(islands/${type}.png)`,
									"--island-color": islandColors[type],
								} as React.CSSProperties}
								onClick={(e) => {
									setIsland(type as IslandNames)
								}}
								key={type}
								></input>
						)
					})}
				</div>
				<a
					href="https://modrinth.com/project/radar"
					target="_blank"
					className="font-normal hover:text-blue-400 transition-colors duration-500 hidable-if-not-enough-space"
				>
					Contribute
				</a>
			</div>
			<dialog
				id="filterMenu"
				className="mb-0 h-[85%] max-h-full w-full max-w-full space-y-2 rounded-lg bg-black p-3 text-white backdrop:bg-gray-700 backdrop:bg-opacity-70 md:w-1/2 md:m-auto"
			>
				<FilterMenu
					selectedFilters={selectedFilters}
					setSelectedFilters={setSelectedFilters}
					enforce={enforce}
					setEnforce={setEnforce}
				/>
				<button
					className="absolute bottom-4 rounded-lg border-2 border-slate-700 bg-slate-800 p-1 transition-colors duration-700 hover:bg-slate-700"
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
			<div
				id="content"
				className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0"
			>
				<MapComponent island={island} />
				<div
					id="list"
					className="mt-4 flex w-full flex-col px-4 text-xl 
						h-[50vh] md:h-auto 
						md:mt-0 md:w-auto
						shrink-0 min-h-0"
				>
					<div className="flex justify-between">
						<h2 className="mr-4 mt-2 text-2xl font-semibold">
							{islandNamesMapping[island]} <span style={{color: "#808080", fontWeight: "normal"}}>({spots[island].length})</span> 
						</h2>
						<div>
							<button
								className="rounded-lg border-2 border-slate-700 bg-slate-800 p-2 transition-colors duration-700 hover:bg-slate-700"
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
					<div
						id="spots"
						className="flex-1 overflow-y-auto mt-4 space-y-2 pr-3 -mr-3 min-h-0"
					>
						{filteredSpots.map((spot, i) => {
							return (
								<div
									key={i}
									className="flex rounded-lg p-2 spot-display"
									style={{"--hover-color": perkColors[spot.color]} as React.CSSProperties}
									onMouseEnter ={() => {
										highlightMarker(spot);
									}}
									onMouseLeave ={(event) => {
										if (!(event.currentTarget == document.activeElement)){
											unhighlightMarker(spot);
										}
									}}
									
								>
									<div
										style={{width: "auto", marginRight: "20px" }}
									>
										<div>{formatPerks(spot).map((perk, j) => {
										return (
											<span
												key={j}
												className="flex items-center"
											>
												<img 
													src={perk.icon}
													style={{ height: "1em", width: "auto", display: "inline-block", marginRight: "2px"}}
												></img>
												{perk.text}
											</span>
										)
									})}</div>
									</div>
									<div
										style={{textAlign: "right",
											width: "auto"
										}}
										className="flex-grow"
									>
										<p>{spot.cords}</p>

										{spot.foundBy !== null && <p>{spot.foundBy}</p>}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</main>
	);
}
