'use client';

import { Button } from '@/components/ui/button';
import type { Application } from '@/types/application';

interface ApplicationCardProps {
  readonly application: Application;
  readonly onViewPost?: () => void;
  readonly onViewApplication?: () => void;
}

export default function ApplicationCard({ application, onViewApplication }: ApplicationCardProps) {
  return (
    <div className="bg-very-dark-gray rounded-xl border border-zinc-700 p-6 transition-colors hover:border-zinc-600">
      <div className="flex items-center justify-between">
        {/* Left side - Candidate info */}
        <div className="flex items-center">
          {/* Candidate Details */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-lg font-semibold text-white">{application.candidateName}</h3>
            <p className="text-lighter-gray-text mb-2 text-sm">
              {application.program} student at {application.university}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-very-dark-gray text-primary-green rounded-md border border-zinc-600 px-2 py-1 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Applied date and actions */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lighter-gray-text mb-4 text-sm">
            Applied{' '}
            {new Date(application.appliedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onViewApplication}
              className="bg-primary-green cursor-pointer px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              View Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
