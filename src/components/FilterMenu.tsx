"use client";
import { capitalize, Filter, renamePerks } from "@/lib/utils";
import { SetStateAction, useState } from "react";

export interface Option {
	value: string;
	label: string;
}

const categories: { [k: string]: string[] } = {
	hooks: ["strong", "wise", "glimmering", "greedy", "lucky"],
	magnets: ["xp", "fish", "pearl", "treasure", "spirit"],
	lures: ["strong", "wise", "glimmering", "greedy", "lucky"],
};

// Build options for a category
const allOptions: Option[] = Object.entries(categories).flatMap(
	([category, names]) =>
		names.map((name) => ({
			value: `${name}_${category}`,
			label: renamePerks(name, category),
		}))
);

interface FilterProps {
	selectedFilters: Filter[];
	setSelectedFilters: React.Dispatch<SetStateAction<Filter[]>>;
	enforce: boolean;
	setEnforce: React.Dispatch<SetStateAction<boolean>>;
}

export default function FilterMenu({
	selectedFilters,
	setSelectedFilters,
	enforce,
	setEnforce,
}: FilterProps) {
	const [selected, setSelected] = useState<string>(allOptions[0].value);
	const [selectedValue, setSelectedValue] = useState<string>("10");

	return (
		<div className="*:select-none h-96">
			<h1 className="text-2xl font-semibold">Filter Menu</h1>

			<div className="flex gap-x-2 items-center">
				<div className="flex">
					<select
						className="bg-black border rounded-l-lg p-1"
						value={selected}
						onChange={(e) => setSelected(e.target.value)}
					>
						{allOptions.map((value) => (
							<option key={value.value} value={value.value}>
								{value.label}
							</option>
						))}
					</select>
					<select
						className="bg-black border rounded-r-lg p-1"
						value={selectedValue}
						onChange={(e) => setSelectedValue(e.target.value)}
					>
						<option value={10}>+10%</option>
						<option value={20}>+20%</option>
						<option value={30}>+30%</option>
					</select>
					<button
						className="border rounded-lg p-1 ml-2"
						onClick={() => {
							const [type, category] = selected.split("_");
							if (
								selectedFilters.some((e) => {
									return (
										e.category === category &&
										e.type === type
									);
								})
							) {
								setSelectedFilters((prev) => {
									const index = prev.findIndex(
										(e) =>
											e.category === category &&
											e.type === type
									);
									prev.splice(index, 1, {
										type,
										category,
										amount:
											category == "lures"
												? null
												: selectedValue,
									});
									return [...prev];
								});
							} else {
								setSelectedFilters((prev) => [
									...prev,
									{
										type,
										category,
										amount:
											category == "lures"
												? null
												: selectedValue,
									},
								]);
							}
						}}
					>
						+ Add
					</button>
				</div>
				<div>
					<input
						type="checkbox"
						checked={enforce}
						onChange={() => setEnforce(!enforce)}
					/>
					<label>Match All</label>
				</div>
			</div>
			<div className="flex flex-wrap gap-2 mt-4">
				{selectedFilters.map((filter, index) => (
					<div key={index} className="flex bg-neutral-800 rounded-lg">
						<button
							className="p-1 mx-1 text-center items-center"
							onClick={() => {
								setSelectedFilters((prev) => {
									return prev.filter((_, i) => i !== index);
								});
							}}
						>
							X
						</button>
						<img
							src={`https://cdn.islandstats.xyz/fishing/perks/${filter.category}/${filter.type}.png`}
							className="w-6 h-6 self-center"
						/>
						<span className="py-1 mr-1 flex-grow">
							{renamePerks(filter.type, filter.category)}
						</span>
						{filter.amount && (
							<span className="bg-neutral-500 h-full p-1 rounded-r-lg">
								{filter.amount}%
							</span>
						)}
					</div>
				))}
			</div>
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
