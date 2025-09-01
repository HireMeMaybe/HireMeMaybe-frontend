// src/features/company-profile/components/JobCard.tsx
"use client";

import { Button } from '@/components/ui/button';
import { MapPin, Users, Edit, Eye } from 'lucide-react';
import type { JobOpening } from '@/types/company';

interface JobCardProps {
  job: JobOpening;
  viewType: 'student' | 'company';
  onApply?: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onViewApplications?: (jobId: string) => void;
}

export default function JobCard({ 
  job, 
  viewType, 
  onApply, 
  onEdit, 
  onViewApplications 
}: JobCardProps) {
  return (
    <div className="bg-background border border-zinc-700 rounded-xl p-6 hover:border-primary-green/50 transition-all duration-200">
      <div className="flex gap-4">
        {/* Job Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-component rounded-lg overflow-hidden">
            {job.imageUrl ? (
              <img 
                src={job.imageUrl} 
                alt={job.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {job.title}
              </h3>
              <p className="text-gray-text text-sm mb-2">
                {job.department}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {viewType === 'company' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(job.id)}
                    className="border-zinc-600 text-white hover:bg-zinc-700 px-3 py-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onViewApplications?.(job.id)}
                    className="bg-primary-green hover:bg-green-700 text-white px-3 py-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Applications
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onApply?.(job.id)}
                  className="bg-primary-green hover:bg-green-700 text-white px-6 py-1"
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
          
          {/* Job Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-text">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{job.type}</span>
            </div>
            {viewType === 'company' && job.applicationCount && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{job.applicationCount} Applications</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}