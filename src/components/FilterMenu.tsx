"use client";
import { Filter, renamePerks } from "@/lib/utils";
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

			<div className="flex gap-2 flex-row md:items-center text-lg *:transition-colors *:duration-700">
				<select
					className="rounded-lg bg-slate-800 p-2"
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
					className="rounded-lg bg-slate-800 p-2"
					value={selectedValue}
					onChange={(e) => setSelectedValue(e.target.value)}
				>
					<option value={10}>+10%</option>
					<option value={20}>+20%</option>
					<option value={30}>+30%</option>
				</select>
				<button
					className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"
					onClick={() => {
						const [type, category] = selected.split("_");
						if (
							selectedFilters.some((e) => {
								return (
									e.category === category && e.type === type
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
					Add
				</button>
			</div>
			<div className="flex gap-1 mt-1">
				<div
					className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700 space-x-2 max-w-fit"
					onClick={() => setEnforce(!enforce)}
				>
					<input
						id="match"
						type="checkbox"
						checked={enforce}
						onChange={() => setEnforce(!enforce)}
					/>
					<span>Match All</span>
				</div>
				<button
					className="rounded-lg bg-slate-800 p-2 hover:bg-red-500"
					onClick={() => setSelectedFilters([])}
				>
					Clear
				</button>
			</div>
			<hr className="my-2 border-neutral-700" />
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
							className="w-6 h-6 self-center mr-1"
						/>
						<span className="py-1 mr-1 flex-grow">
							{renamePerks(filter.type, filter.category)}
						</span>
						{filter.amount && (
							<span className="h-full rounded-r-lg bg-neutral-500 p-1">
								{filter.amount}%
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
