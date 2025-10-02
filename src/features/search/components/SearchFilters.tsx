"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const filterOptions = {
  "Job Type": ["Onsite", "Hybrid", "Remote"],
  "Tag": ["Finance", "Technology", "Banking", "Healthcare", "Education", "Marketing"],
  "Salary": ["Less than 15,000", "15,000-30,000", "30,000-50,000", "50,000-80,000", "80,000-120,000", "More than 120,000"],
  "Experience Level": ["Internship", "Junior", "Mid-Level", "Senior", "Lead/Principal", "Executive"],
  "Company": ["OCS", "AIS Innovation Lab", "LINE Thailand", "SCB TechX", "Grab", "True Digital Group"],
  "Company Size": ["1-50", "51-500", "501-5,000", "5,000+"],
  "Industry": ["Technology", "Banking", "Telecommunications", "Transportation", "E-commerce", "Healthcare"],
  "Date Posted": ["Past 24 hours", "Past Week", "Past Month"],
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