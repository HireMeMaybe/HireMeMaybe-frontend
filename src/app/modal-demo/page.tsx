'use client';

import { useState } from 'react';
import { Button } from 'src/components/ui/button';
import Navbar from "src/components/NavBar";
import Footer from "src/components/Footer";
import { SuccessModal } from 'src/components/modals/SuccessModal';
import { ErrorModal } from 'src/components/modals/UnsuccessModal';
import { ConfirmationModal } from 'src/components/modals/ConfirmModal';
import { DeleteModal } from 'src/components/modals/DeleteModal';
import { ApproveModal } from 'src/components/modals/ApproveModal';
import { WarningModal } from 'src/components/modals/WarningModal';
import { ReportModal } from 'src/components/modals/ReportModal';

export default function ModalDemo() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Modal Components Demo</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => openModal('success')}
              className="p-6 h-auto bg-primary-green hover:bg-green-700"
            >
              Success Modal
            </Button>
            
            <Button
              onClick={() => openModal('error')}
              variant="destructive"
              className="p-6 h-auto bg-red-reject hover:bg-red-700"
            >
              Error Modal
            </Button>
            
            <Button
              onClick={() => openModal('confirmation')}
              className="p-6 h-auto bg-sky-blue hover:bg-blue-700"
            >
              Confirmation Modal
            </Button>
            
            <Button
              onClick={() => openModal('delete')}
              variant="destructive"
              className="p-6 h-auto bg-red-reject hover:bg-red-700"
            >
              Delete Modal
            </Button>
            
            <Button
              onClick={() => openModal('approve')}
              className="p-6 h-auto bg-primary-green  hover:bg-green-700"
            >
              Approve Modal
            </Button>
            
            <Button
              onClick={() => openModal('warning')}
              className="p-6 h-auto bg-yellow-warning hover:bg-yellow-700 text-black"
            >
              Warning Modal
            </Button>
            
            <Button
              onClick={() => openModal('report')}
              className="p-6 h-auto bg-red-reject hover:bg-red-700"
            >
              Report Modal
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <SuccessModal 
        isOpen={activeModal === 'success'} 
        onClose={closeModal}
        onConfirm={() => console.log('Success confirmed')}
      />
      
      <ErrorModal 
        isOpen={activeModal === 'error'} 
        onClose={closeModal}
        onRetry={() => console.log('Retry clicked')}
        onCancel={() => console.log('Cancel clicked')}
      />
      
      <ConfirmationModal 
        isOpen={activeModal === 'confirmation'} 
        onClose={closeModal}
        onConfirm={() => console.log('Confirmed')}
      />
      
      <DeleteModal 
        isOpen={activeModal === 'delete'} 
        onClose={closeModal}
        onConfirm={() => console.log('Delete confirmed')}
      />
      
      <ApproveModal 
        isOpen={activeModal === 'approve'} 
        onClose={closeModal}
        onApprove={() => console.log('Approved')}
        onReject={() => console.log('Rejected')}
      />
      
      <WarningModal 
        isOpen={activeModal === 'warning'} 
        onClose={closeModal}
        onSave={() => console.log('Save clicked')}
        onLeave={() => console.log('Leave clicked')}
      />
      
      <ReportModal 
        isOpen={activeModal === 'report'} 
        onClose={closeModal}
        onSubmit={(data) => console.log('Report submitted:', data)}
      />
    </div>
  );
}