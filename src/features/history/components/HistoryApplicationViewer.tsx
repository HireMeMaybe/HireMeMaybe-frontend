'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Loading from '@/app/loading';
import { ResumePreviewModal } from '@/components/modals';
import { useHistoryApplication } from '../hooks/useHistoryApplication';
import { CpskService } from '@/lib/services/cpsk.service';
import type { ProfileData } from '@/types/cpsk';

interface HistoryApplicationViewerProps {
  readonly applicationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-300 border-yellow-500/20',
  'in consideration': 'bg-blue-400/10 text-blue-300 border-blue-500/20',
  rejected: 'bg-red-400/10 text-red-300 border-red-500/20',
};

const EXPERIENCE_LABELS: Record<number, string> = {
  0: 'No experience',
  1: 'Less than 1 year',
  3: '1-2 years',
  5: '3-5 years',
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in consideration':
      return 'In Consideration';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatExperience = (years?: number | null) => {
  if (years == null) return '-';
  return EXPERIENCE_LABELS[years] || `${years}+ years`;
};

const normalizeSoftSkills = (profile?: ProfileData): string[] => {
  if (!profile?.soft_skill) return [];
  if (Array.isArray(profile.soft_skill)) return profile.soft_skill;
  if (typeof profile.soft_skill === 'string') {
    return profile.soft_skill
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }
  return [];
};

const DisplayField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-3">
    <Label className="flex items-center text-sm text-white/90">{label}</Label>
    <div className="bg-muted border-border text-white/90 flex h-12 items-center rounded-lg border px-4 text-base">
      {value && value.trim() ? value : '-'}
    </div>
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="bg-darker-gray rounded-2xl border border-gray-700 p-6 shadow-inner shadow-black/20">
    <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
    {children}
  </div>
);

const TagList = ({ items }: { items: string[] }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-400">No entries provided</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="bg-gray-800 text-gray-100 rounded-full border border-gray-600 px-3 py-1 text-xs"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default function HistoryApplicationViewer({ applicationId }: HistoryApplicationViewerProps) {
  const { data, loading, error, refetch } = useHistoryApplication(applicationId);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [resumePreviewError, setResumePreviewError] = useState<string | null>(null);

  const profile = data?.profile;
  const application = data?.application;
  const job = data?.job;
  const educationLevel = profile?.year == null ? '-' : String(profile.year);
  const companyName =
    job?.company_user?.name ||
    job?.company_user?.User?.username ||
    job?.company_user?.user?.username ||
    'Company unavailable';

  const softSkills = useMemo(() => normalizeSoftSkills(profile), [profile]);
  const programmingLanguages = application?.answer?.programming_languages || [];

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const handleResumePreview = async () => {
    if (!application?.resume_id) {
      setResumePreviewError('No resume is attached to this application.');
      setIsResumePreviewOpen(true);
      return;
    }

    setResumePreviewLoading(true);
    setResumePreviewError(null);
    try {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
      const blob = await CpskService.previewResume(application.resume_id);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setResumePreviewUrl(url);
    } catch (previewError) {
      console.error('Failed to preview resume:', previewError);
      setResumePreviewError(
        previewError instanceof Error ? previewError.message : 'Failed to preview resume.'
      );
    } finally {
      setResumePreviewLoading(false);
      setIsResumePreviewOpen(true);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !application || !profile) {
    return (
      <div className="bg-background text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400">
          {error || 'This application is no longer available. Please go back to your history.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => void refetch()} className="cursor-pointer bg-primary-green">
            Try Again
          </Button>
          <Button variant="outline" asChild className="cursor-pointer border-gray-600 text-white">
            <a href="/history">Back to History</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="cursor-pointer px-0 text-gray-400 hover:text-white"
            asChild
          >
            <a href="/history" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </a>
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-700 bg-very-dark-gray p-6 shadow-lg lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-gray-400 text-sm">Applied {formatDate(application.applied_at)}</p>
            <h1 className="text-3xl font-bold text-white">{job?.title || 'Application Form'}</h1>
            <p className="text-gray-400">
              {companyName}
              {job?.location ? ` • ${job.location}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <span
              className={`rounded-full border px-4 py-1 text-sm font-medium ${
                STATUS_STYLES[application.status] || 'bg-gray-700 text-gray-300 border-gray-600'
              }`}
            >
              {formatStatus(application.status)}
            </span>
            {job?.id && (
              <Button
                asChild
                variant="outline"
                className="cursor-pointer border-gray-600 text-white hover:bg-gray-800"
              >
                <a href={`/job-post/${job.id}`} target="_blank" rel="noopener noreferrer">
                  View Job Post
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField label="Name" value={profile.first_name} />
              <DisplayField label="Surname" value={profile.last_name} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField
                label="Email"
                value={profile.User?.email || profile.User?.username || '-'}
              />
              <DisplayField label="Phone" value={profile.User?.tel || '-'} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField label="Major" value={profile.program || '-'} />
              <DisplayField label="Education Level" value={educationLevel} />
            </div>
          </SectionCard>

          <SectionCard title="Skills & Resume">
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-sm text-white/90">Soft Skills</Label>
                <TagList items={softSkills} />
              </div>

              <div>
                <Label className="mb-2 block text-sm text-white/90">Resume</Label>
                {application.resume_id ? (
                  <div className="bg-muted flex flex-col justify-between gap-4 rounded-lg border border-gray-600 p-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-medium text-white">Submitted resume</p>
                      <p className="text-muted text-sm">Resume ID: {application.resume_id}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleResumePreview()}
                      disabled={resumePreviewLoading}
                      className="bg-primary-green hover:bg-green-600 flex cursor-pointer items-center gap-2 px-4 text-white"
                    >
                      <Eye className="h-4 w-4" />
                      {resumePreviewLoading ? 'Loading...' : 'Preview'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No resume attached to this application.</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Application Answers">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DisplayField
                  label="Right to Work"
                  value={application.answer?.right_to_work || '-'}
                />
                <DisplayField
                  label="Expected Monthly Salary"
                  value={application.answer?.expected_salary || '-'}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DisplayField
                  label="Years of Experience"
                  value={formatExperience(application.answer?.year_of_experience)}
                />
                <div className="space-y-3">
                  <Label className="flex items-center text-sm text-white/90">
                    Programming Languages
                  </Label>
                  <TagList items={programmingLanguages} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <ResumePreviewModal
        isOpen={isResumePreviewOpen}
        onClose={() => {
          setIsResumePreviewOpen(false);
          if (resumePreviewUrl) {
            URL.revokeObjectURL(resumePreviewUrl);
            setResumePreviewUrl(null);
          }
          setResumePreviewError(null);
        }}
        resumeUrl={resumePreviewUrl}
        error={resumePreviewError}
        isLoading={resumePreviewLoading}
      />
    </div>
  );
}
