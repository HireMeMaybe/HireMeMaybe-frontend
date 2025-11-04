'use client';

import React, { useState } from 'react';
import { useJobPosts } from '@/features/admin';
import type { JobPostItem } from '@/types/admin';
import { DeleteModal, SuccessModal, UnsuccessModal } from '@/components/modals';

export function ManageJobPostsPage() {
  const { jobPosts, isLoading, deleteJobPost } = useJobPosts();
  const [selectedPost, setSelectedPost] = useState<JobPostItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleView = (post: JobPostItem) => {
    // Open job post detail page in new tab
    window.open(`/job-post/${post.id}`, '_blank');
  };

  const handleDelete = (post: JobPostItem) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    setIsDeleting(true);
    try {
      const result = await deleteJobPost(selectedPost.id);
      setIsDeleteModalOpen(false);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Failed to delete job post:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete job post');
      setShowErrorModal(true);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setSelectedPost(null);
    }
  };

  const getReportColor = (count: number) => {
    if (count === 0) return 'text-primary-green';
    if (count >= 1 && count < 4) return 'text-yellow-warning';
    return 'text-red-reject';
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Manage Job Posts</h1>
          <p className="text-gray-400">Monitor and manage job postings on the platform</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">Job Posts Overview</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Job Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Posted</th>
                  <th className="px-6 py-3">Reports</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          Loading job posts...
                        </td>
                      </tr>
                    );
                  }
                  if (jobPosts.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No job posts found
                        </td>
                      </tr>
                    );
                  }
                  return jobPosts.map((post) => (
                    <tr key={post.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{post.title}</div>
                        <div className="mt-1 text-xs text-gray-400">{post.company}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{post.type}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{post.posted}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`font-medium ${getReportColor(post.reports)}`}>
                          {post.reports}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(post)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="bg-red-reject cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setSelectedPost(null);
          }
        }}
        onConfirm={confirmDelete}
        title={`Delete Job Post?`}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Job post has been successfully deleted"
      />

      {/* Error Modal */}
      <UnsuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage || 'Failed to delete job post'}
      />
    </div>
  );
}

export default ManageJobPostsPage;
