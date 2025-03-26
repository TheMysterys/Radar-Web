import { Filter } from "@/lib/utils";

const categories: { [k: string]: string[] } = {
	hooks: ["strong", "wise", "glimmering", "greedy", "lucky"],
	magnets: ["xp", "fish", "pearl", "treasure", "spirit"],
	lures: ["strong", "wise", "glimmering", "greedy", "lucky"],
};

const filterLevels = ["0", "10", "20", "30"];

interface FilterProps {
	selectedFilters: Record<string, Record<string, string>>;
	setSelectedFilters: React.Dispatch<React.SetStateAction<Filter>>;
}

export default function FilterMenu({
	selectedFilters,
	setSelectedFilters,
}: FilterProps) {
	// Function to cycle through filter states
	const toggleFilter = (category: keyof Filter, option: string) => {
		setSelectedFilters((prev) => {
			const current = prev[category]?.[option] || "Off";
			const nextState =
				filterLevels[
					(filterLevels.indexOf(current) + 1) % filterLevels.length
				];

			return {
				...prev,
				[category]: { ...prev[category], [option]: nextState },
			};
		});
	};

	const toggleOnOff = (category: keyof Filter, option: string) => {
		setSelectedFilters((prev) => {
			const current = prev[category]?.[option] || "Off";
			const nextState = current == "0" ? "off" : "0";

			return {
				...prev,
				[category]: { ...prev[category], [option]: nextState },
			};
		});
	};

	// Function to cycle through all filter states for a category
	const toggleAll = (category: keyof Filter) => {
		setSelectedFilters((prev) => {
			const currentCategory = prev[category] ?? {}; // Ensure it's an object
			const allStates = Object.values(currentCategory);
			const allSame =
				allStates.filter(
					(value) =>
						value ===
						Object.values(selectedFilters[category] ?? {})[0]
				).length === allStates.length;

			const nextStateIndex = allSame
				? (filterLevels.indexOf(allStates[0] || "off") + 1) %
				  filterLevels.length
				: 1;

			const nextState = filterLevels[nextStateIndex];

			const newCategoryState = Object.fromEntries(
				categories[category].map((option) => [option, nextState]) // Apply the same state to all options
			);

			return { ...prev, [category]: newCategoryState };
		});
	};

	const toggleAllOnOff = (category: keyof Filter) => {
		setSelectedFilters((prev) => {
			const currentCategory = prev[category] ?? {}; // Ensure it's an object
			const allStates = Object.values(currentCategory);
			const allSame =
				allStates.filter(
					(value) =>
						value ===
						Object.values(selectedFilters[category] ?? {})[0]
				).length === allStates.length;

			const nextState = allSame
				? allStates[0] == "0"
					? "off"
					: "0"
				: "0";

			const newCategoryState = Object.fromEntries(
				categories[category].map((option) => [option, nextState]) // Apply the same state to all options
			);

			return { ...prev, [category]: newCategoryState };
		});
	};

	return (
		<div className="*:select-none ">
			<h1 className="text-2xl font-semibold">Filter Menu</h1>

			<div className="flex gap-x-2 *:flex-grow ">
				<div className="flex p-2 rounded border-2 font-bold select-none items-center justify-center _0">
					On
				</div>
				<div className="flex p-2 rounded border-2 font-bold select-none items-center justify-center _10">
					+10%
				</div>
				<div className="flex p-2 rounded border-2 font-bold select-none items-center justify-center _20">
					+20%
				</div>
				<div className="flex p-2 rounded border-2 font-bold select-none items-center justify-center _30">
					+30%
				</div>
			</div>

			{Object.entries(categories).map(([category, options]) => (
				<div key={category}>
					{category !== "lures" ? (
						<div className="mb-4">
							<h3 className="font-semibold text-lg">
								{category.toUpperCase()}
							</h3>
							<div className="flex gap-2 flex-wrap mt-2">
								{/* "Select All" Button */}
								<button
									className={`flex p-2 rounded border-2 font-bold items-center _${
										Object.values(
											selectedFilters[category] ?? {}
										).filter(
											(value) =>
												value ===
												Object.values(
													selectedFilters[category] ??
														{}
												)[0]
										).length === options.length
											? Object.values(
													selectedFilters[category] ??
														{}
											  )[0]
											: "off"
									}`}
									onClick={() =>
										toggleAll(category as keyof Filter)
									}
								>
									<span className="w-8">All</span>
								</button>

								{/* Individual Filter Buttons */}
								{options.map((option) => (
									<button
										key={`${category}-${option}`}
										className={`p-2 rounded border-2 _${selectedFilters[category]?.[option]}`}
										onClick={() =>
											toggleFilter(
												category as keyof Filter,
												option
											)
										}
									>
										<img
											src={`https://cdn.islandstats.xyz/fishing/perks/${category}/${option}.png`}
											className="w-8"
										/>
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="mb-4">
							<h3 className="font-semibold text-lg">
								{category.toUpperCase()}
							</h3>
							<div className="flex gap-2 flex-wrap mt-2">
								{/* "Select All" Button */}
								<button
									className={`flex p-2 rounded border-2 font-bold select-none items-center _${
										Object.values(
											selectedFilters[category] ?? {}
										).filter(
											(value) =>
												value ===
												Object.values(
													selectedFilters[category] ??
														{}
												)[0]
										).length === options.length
											? Object.values(
													selectedFilters[category] ??
														{}
											  )[0]
											: "off"
									}`}
									onClick={() => toggleAllOnOff(category)}
								>
									<span className="w-8">All</span>
								</button>

								{/* Individual Filter Buttons */}
								{options.map((option) => (
									<button
										key={`${category}-${option}`}
										className={`p-2 rounded border-2 _${selectedFilters[category]?.[option]}`}
										onClick={() =>
											toggleOnOff(category, option)
										}
									>
										<img
											src={`https://cdn.islandstats.xyz/fishing/perks/${category}/${option}.png`}
											className="w-8"
										/>
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
	/* <>
			<div className="flex flex-col gap-5">
				<h1 className="font-semibold text-2xl">Filter Menu</h1>
				<div className="flex flex-row gap-2">
					<button className="flex p-2 border-2 border-gray-50 border-opacity-80 rounded-lg items-center text-center">
						<p className="w-8">All</p>
					</button>
					<button
						className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg _30"
						onClick={() => {}}
					>
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/hooks/strong.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/hooks/wise.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/hooks/glimmering.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/hooks/greedy.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/hooks/lucky.png"
							className="w-8"
						/>
					</button>
				</div>
				<div className="flex flex-row gap-2">
					<button className="flex p-2 border-2 border-gray-50 border-opacity-80 rounded-lg items-center text-center">
						<p className="w-8">All</p>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/magnets/xp.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/magnets/fish.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/magnets/pearl.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/magnets/treasure.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/magnets/spirit.png"
							className="w-8"
						/>
					</button>
				</div>
				<div className="flex flex-row gap-2">
					<button className="flex p-2 border-2 border-gray-50 border-opacity-80 rounded-lg items-center text-center">
						<p className="w-8">All</p>
					</button>
					<button className="flex p-2 border-2 border-gray-50 border-opacity-80 rounded-lg items-center">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/lures/strong.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/lures/wise.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/lures/glimmering.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/lures/greedy.png"
							className="w-8"
						/>
					</button>
					<button className="p-2 border-2 border-gray-50 border-opacity-80 rounded-lg">
						<img
							src="https://cdn.islandstats.xyz/fishing/perks/lures/lucky.png"
							className="w-8"
						/>
					</button>
				</div>
			</div>
		</>*/
}
