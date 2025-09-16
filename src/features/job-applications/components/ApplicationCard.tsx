"use client";

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import type { Application } from '@/types/application';

interface ApplicationCardProps {
  readonly application: Application;
  readonly onViewPost?: () => void;
  readonly onViewApplication?: () => void;
}

export default function ApplicationCard({ 
  application,
  onViewPost,
  onViewApplication 
}: ApplicationCardProps) {
  return (
    <div className="bg-very-dark-gray border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left side - Candidate info */}
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center overflow-hidden">
              {application.profilePicture ? (
                <img 
                  src={application.profilePicture} 
                  alt={`${application.candidateName} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          
          {/* Candidate Details */}
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              {application.candidateName}
            </h3>
            <p className="text-lighter-gray-text text-sm mb-2">
              {application.program} student at {application.university}
            </p>
            
            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-very-dark-gray text-xs text-primary-green rounded-md border border-zinc-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Applied date and actions */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lighter-gray-text text-sm mb-4">
            Applied {new Date(application.appliedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short', 
              day: 'numeric'
            })}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onViewApplication}
              className="bg-primary-green hover:bg-green-700 text-white px-4 py-2 text-sm cursor-pointer"
            >
              View Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}