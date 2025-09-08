"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const filters = [
  "Job Type",
  "Tag",
  "Salary",
  "Experience Level",
  "Company",
  "Industry",
  "Date Posted",
  "Location",
];

export default function SearchFilters() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {filters.map((filter) => (
        <Select key={filter}>
          <SelectTrigger className="bg-darker-gray rounded-full border-none text-white text-sm px-4">
            <SelectValue placeholder={filter} />
          </SelectTrigger>
          <SelectContent className="bg-darker-gray border-gray-600">
            <SelectItem value="option1" className="text-white hover:bg-gray-700">
              Option 1
            </SelectItem>
            <SelectItem value="option2" className="text-white hover:bg-gray-700">
              Option 2
            </SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
