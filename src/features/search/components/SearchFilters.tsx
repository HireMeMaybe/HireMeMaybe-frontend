"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const filterOptions = {
  "Job Type": ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
  "Tag": ["Finance", "Technology", "Banking", "Healthcare", "Education", "Marketing"],
  "Salary": ["0-30k", "30k-50k", "50k-80k", "80k-120k", "120k+"],
  "Experience Level": ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"],
  "Company": ["OCS", "AIS Innovation Lab", "LINE Thailand", "SCB TechX", "Grab", "True Digital Group"],
  "Industry": ["Technology", "Banking", "Telecommunications", "Transportation", "E-commerce", "Healthcare"],
  "Date Posted": ["Today", "This Week", "This Month", "Last 3 Months"],
  "Location": ["Bangkok", "Chiang Mai", "Phuket", "Remote", "Hybrid"],
};

export default function SearchFilters() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Object.entries(filterOptions).map(([filterName, options]) => (
        <Select key={filterName}>
          <SelectTrigger className="bg-darker-gray rounded-full border-none text-white text-sm px-4 cursor-pointer">
            <SelectValue placeholder={filterName} />
          </SelectTrigger>
          <SelectContent className="bg-darker-gray border-gray-600">
            {options.map((option) => (
              <SelectItem 
                key={option} 
                value={option.toLowerCase().replace(/\s+/g, '-')} 
                className="text-white hover:bg-gray-700 cursor-pointer"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}