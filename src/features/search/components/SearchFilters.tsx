'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SearchFilterKey =
  | 'type'
  | 'tag'
  | 'salary'
  | 'exp'
  | 'company'
  | 'industry'
  | 'location';

interface SearchFiltersProps {
  readonly filters: Partial<Record<SearchFilterKey, string>>;
  readonly onFilterChange: (key: SearchFilterKey, value: string | undefined) => void;
  readonly disabled?: boolean;
  readonly companyOptions?: string[];
  readonly industryOptions?: string[];
  readonly tagOptions?: string[];
  readonly locationOptions?: string[];
}

const CLEAR_FILTER_VALUE = '__all__';

const JOB_TYPE_OPTIONS = ['Onsite', 'Hybrid', 'Remote'];

const EXPERIENCE_LEVEL_OPTIONS = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Executive',
];

const SALARY_RANGE_OPTIONS = [
  'Less than 15,000',
  '15,000 - 30,000',
  '30,000 - 50,000',
  '50,000 - 80,000',
  '80,000 - 120,000',
  'More than 120,000',
];

const TAG_OPTIONS = [
  'Finance',
  'Technology',
  'Banking',
  'Healthcare',
  'Education',
  'Marketing',
  'Design',
  'Engineering',
];

export default function SearchFilters({
  filters,
  onFilterChange,
  disabled = false,
  companyOptions = [],
  industryOptions = [],
  tagOptions = TAG_OPTIONS,
  locationOptions = [],
}: SearchFiltersProps) {
  const filterConfig: Array<{
    key: SearchFilterKey;
    label: string;
    options: { label: string; value: string }[];
  }> = [
    {
      key: 'type',
      label: 'Job Type',
      options: JOB_TYPE_OPTIONS.map((value) => ({ label: value, value })),
    },
    {
      key: 'tag',
      label: 'Tag',
      options: (tagOptions.length > 0 ? tagOptions : TAG_OPTIONS).map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'salary',
      label: 'Salary',
      options: SALARY_RANGE_OPTIONS.map((value) => ({ label: value, value })),
    },
    {
      key: 'exp',
      label: 'Experience Level',
      options: EXPERIENCE_LEVEL_OPTIONS.map((value) => ({ label: value, value })),
    },
    {
      key: 'company',
      label: 'Company',
      options: companyOptions.map((value) => ({ label: value, value })),
    },
    {
      key: 'industry',
      label: 'Industry',
      options: industryOptions.map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value,
      })),
    },
    {
      key: 'location',
      label: 'Location',
      options: locationOptions.map((value) => ({ label: value, value })),
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {filterConfig.map(({ key, label, options }) => {
        const value = filters[key] ?? CLEAR_FILTER_VALUE;
        const hasOptions = options.length > 0;

        return (
          <Select
            key={key}
            value={value}
            onValueChange={(nextValue) => {
              if (nextValue === CLEAR_FILTER_VALUE) {
                onFilterChange(key, undefined);
                return;
              }
              onFilterChange(key, nextValue);
            }}
            disabled={disabled || (key === 'company' && !hasOptions)}
          >
            <SelectTrigger className="bg-darker-gray rounded-full border-none px-4 text-sm text-white">
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent className="bg-darker-gray border-gray-600">
              <SelectItem
                value={CLEAR_FILTER_VALUE}
                className="cursor-pointer text-white hover:bg-gray-700"
              >
                Any {label}
              </SelectItem>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer text-white hover:bg-gray-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
