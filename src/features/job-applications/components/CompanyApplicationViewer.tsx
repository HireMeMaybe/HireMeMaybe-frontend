'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, Flag } from 'lucide-react';
import Loading from '@/app/loading';
import { ResumePreviewModal, ReportModal, SuccessModal } from '@/components/modals';
import { useCompanyApplication } from '../hooks/useCompanyApplication';
import { CompanyService } from '@/lib/services/company.service';
import type { ApplicationCpskUser } from '@/lib/services/job.service';
import { AdminService } from '@/lib/services';

interface CompanyApplicationViewerProps {
  readonly applicationId: string;
  readonly companyId: string;
}

const EXPERIENCE_LABELS: Record<number, string> = {
  0: 'No experience',
  1: 'Less than 1 year',
  3: '1-2 years',
  5: '3-5 years',
};

const formatExperience = (years?: number | null) => {
  if (years == null) return '-';
  return EXPERIENCE_LABELS[years] || `${years}+ years`;
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

const getCandidateName = (user?: ApplicationCpskUser | null, fallbackId?: string) => {
  const first = user?.first_name?.trim() || '';
  const last = user?.last_name?.trim() || '';
  const fullName = [first, last].filter(Boolean).join(' ');
  return fullName || (fallbackId ? `Applicant ${fallbackId}` : 'Applicant');
};

const getProgram = (user?: ApplicationCpskUser | null) => user?.program || 'Program not specified';

const getYearDisplay = (user?: ApplicationCpskUser | null) => {
  const rawYear = user?.year?.trim();
  if (!rawYear) return '-';
  return rawYear.toLowerCase().startsWith('year') ? rawYear : `Year ${rawYear}`;
};

const DisplayField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-2">
    <Label className="text-sm text-white/80">{label}</Label>
    <div className="bg-muted border-border flex min-h-[3rem] items-center rounded-lg border px-4 text-base text-white/90">
      {value && value.trim() ? value : '-'}
    </div>
  </div>
);

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
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
          className="rounded-full border border-gray-600 bg-gray-800 px-3 py-1 text-xs text-gray-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default function CompanyApplicationViewer({
  applicationId,
  companyId,
}: CompanyApplicationViewerProps) {
  const { data, loading, error, refetch } = useCompanyApplication(applicationId);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [resumePreviewError, setResumePreviewError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const application = data?.application;
  const job = data?.job;

  const candidateName = useMemo(
    () => getCandidateName(application?.cpsk_user, application?.cpsk_id),
    [application]
  );
  const program = getProgram(application?.cpsk_user);
  const yearDisplay = getYearDisplay(application?.cpsk_user);
  const cpskAccount = application?.cpsk_user?.user || application?.cpsk_user?.User || null;
  const contactEmail = cpskAccount?.email || cpskAccount?.username || '-';
  const contactPhone = cpskAccount?.tel || '-';
  const softSkills = application?.cpsk_user?.soft_skill || [];
  const languages = application?.answer?.programming_languages || [];
  const reportedUserId =
    application?.cpsk_id ||
    application?.cpsk_user?.user?.id ||
    application?.cpsk_user?.User?.id ||
    null;
  const canReportApplicant = Boolean(reportedUserId);

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
      const blob = await CompanyService.fetchFile(application.resume_id);
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

  if (error || !application || !job) {
    return (
      <div className="bg-background text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400">
          {error || 'Unable to load this application. Please return to your applications list.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => void refetch()} className="bg-primary-green text-white">
            Try Again
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
            asChild
          >
            <a href={`/company/${companyId}/applications`}>Back to Applications</a>
          </Button>
        </div>
      </div>
    );
  }

  const jobPostUrl = job.id ? `/job-post/${job.id}` : null;

  const handleReportSubmit = async (details: string) => {
    if (!reportedUserId) {
      setReportError('Unable to identify this applicant for reporting.');
      return;
    }

    try {
      setReportError(null);
      await AdminService.submitReport({
        reported_id: reportedUserId,
        reportedEntityType: 'user',
        reason: details || 'No reason provided',
      });
      setReportSuccess(true);
    } catch (err) {
      console.error('Failed to submit applicant report:', err);
      setReportError('Failed to submit report. Please try again later.');
    } finally {
      setShowReportModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="cursor-pointer px-0 text-gray-400 hover:text-white"
            asChild
          >
            <a href={`/company/${companyId}/applications`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </a>
          </Button>
        </div>

        <div className="bg-very-dark-gray mb-8 flex flex-col gap-4 rounded-2xl border border-gray-700 p-6 shadow-lg lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-400">Applied {formatDate(application.applied_at)}</p>
            <h1 className="text-3xl font-bold text-white">{job.title || 'Job Application'}</h1>
            <p className="text-gray-400">
              {job.location || 'Location not specified'}
              {job.type ? ` • ${job.type}` : ''}
            </p>
            <span className="rounded-full bg-gray-800 px-4 py-1 text-xs font-medium text-white capitalize">
              {application.status || 'pending'}
            </span>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex w-full flex-col-reverse flex-wrap items-end gap-2">
              {canReportApplicant && (
                <Button
                  variant="outline"
                  className="border-red-500/70 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setReportError(null);
                    setShowReportModal(true);
                  }}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
            </div>
            {jobPostUrl && (
              <Button
                asChild
                variant="outline"
                className="cursor-pointer border-gray-600 text-white hover:bg-gray-800"
              >
                <a href={jobPostUrl} target="_blank" rel="noopener noreferrer">
                  View Job Post
                </a>
              </Button>
            )}
            {canReportApplicant && reportError && (
              <p className="text-sm text-red-400">{reportError}</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <SectionCard title="Candidate Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField label="Name" value={candidateName} />
              <DisplayField label="Program" value={program} />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField label="Year" value={yearDisplay} />
              <DisplayField label="CPSK ID" value={application.cpsk_id} />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField label="Email" value={contactEmail} />
              <DisplayField label="Phone" value={contactPhone} />
            </div>
          </SectionCard>

          <SectionCard title="Skills & Resume">
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-sm text-white/90">Soft Skills</Label>
                <TagList items={softSkills} />
              </div>

              <div>
                <Label className="mb-2 block text-sm text-white/90">Programming Languages</Label>
                <TagList items={languages} />
              </div>

              <div>
                <Label className="mb-2 block text-sm text-white/90">Resume</Label>
                {application.resume_id ? (
                  <div className="bg-muted flex flex-col justify-between gap-4 rounded-lg border border-gray-600 p-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-medium text-white">Resume ID: {application.resume_id}</p>
                      <p className="text-muted text-sm">Preview the submitted resume.</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleResumePreview()}
                      disabled={resumePreviewLoading}
                      className="bg-primary-green flex cursor-pointer items-center gap-2 px-4 text-white hover:bg-green-600"
                    >
                      <Eye className="h-4 w-4" />
                      {resumePreviewLoading ? 'Loading...' : 'Preview'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No resume was attached.</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Application Answers">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField
                label="Right to Work"
                value={application.answer?.right_to_work || '-'}
              />
              <DisplayField
                label="Expected Salary"
                value={application.answer?.expected_salary || '-'}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DisplayField
                label="Years of Experience"
                value={formatExperience(application.answer?.year_of_experience)}
              />
              <DisplayField label="Status" value={application.status || '-'} />
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
      {canReportApplicant && showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="user"
          onSubmit={(payload) => {
            void handleReportSubmit(payload.details);
          }}
        />
      )}
      {canReportApplicant && reportSuccess && (
        <SuccessModal
          isOpen={reportSuccess}
          onClose={() => setReportSuccess(false)}
          title="Report Submitted"
          message="Thank you for helping keep the community safe."
          buttonText="Close"
          description="Our team will review this applicant shortly."
        />
      )}
    </div>
  );
}
