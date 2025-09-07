"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Camera, User } from 'lucide-react';
import { WarningModal } from '@/components/modals';
import type { Company } from '@/types/company';
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from '@/types/company';

interface EditProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly company: Company;
  readonly onSave?: (updatedCompany: Partial<Company>, logoFile?: File, bannerFile?: File) => Promise<void>;
}

interface FormData {
  name: string;
  about: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: string;
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  company,
  onSave 
}: EditProfileModalProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: company.name,
    about: company.about,
    email: company.email,
    phone: company.phone,
    industry: company.industry,
    employeeCount: company.employeeCount,
  });

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(company.logoUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(company.bannerUrl || '');

  // UI states
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Reset form when company data changes
  useEffect(() => {
    setFormData({
      name: company.name,
      about: company.about,
      email: company.email,
      phone: company.phone,
      industry: company.industry,
      employeeCount: company.employeeCount,
    });
    setLogoPreview(company.logoUrl || '');
    setBannerPreview(company.bannerUrl || '');
    setLogoFile(null);
    setBannerFile(null);
  }, [company]);

  // Check for changes
  useEffect(() => {
    const hasFormChanges = (
      formData.name !== company.name ||
      formData.about !== company.about ||
      formData.email !== company.email ||
      formData.phone !== company.phone ||
      formData.industry !== company.industry ||
      formData.employeeCount !== company.employeeCount
    );
    const hasFileChanges = logoFile !== null || bannerFile !== null;
    setHasChanges(hasFormChanges || hasFileChanges);
  }, [formData, logoFile, bannerFile, company]);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file uploads
  const handleFileChange = (type: 'logo' | 'banner', file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 10MB' }));
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: 'Only JPG, JPEG, and PNG files are allowed' }));
      return;
    }

    // Clear previous error
    setErrors(prev => ({ ...prev, [type]: '' }));

    // Set file and create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(result);
      } else {
        setBannerFile(file);
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const removeFile = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoFile(null);
      setLogoPreview(company.logoUrl || '');
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setBannerFile(null);
      setBannerPreview(company.bannerUrl || '');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'About us is required';
    } else if (formData.about.trim().length < 10) {
      newErrors.about = 'About us must be at least 10 characters';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.employeeCount) {
      newErrors.employeeCount = 'Please select company size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSave?.(formData, logoFile || undefined, bannerFile || undefined);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with warning check
  const handleClose = () => {
    if (hasChanges && !isSubmitting) {
      setShowWarning(true);
    } else {
      onClose();
    }
  };

  // Handle warning modal actions
  const handleLeaveWithoutSaving = () => {
    setShowWarning(false);
    onClose();
  };

  const handleSaveAndStay = async () => {
    setShowWarning(false);
    await handleSave();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent 
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-zinc-700 text-white"
          showCloseButton={false}
        >
          {/* Hidden accessibility components */}
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Edit your company profile information
          </DialogDescription>
          
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Edit your profile</h2>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-component border-2 border-zinc-600 overflow-hidden flex items-center justify-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Company logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => removeFile('logo')}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-primary-green hover:bg-green-700 text-white px-4 py-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload photo
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeFile('logo')}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      Remove photo
                    </Button>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange('logo', file);
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  At least 512 x 512 px PNG or JPG file
                </p>
                {errors.logo && <p className="text-xs text-red-400">{errors.logo}</p>}
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Banner</Label>
                <div className="space-y-3">
                  <div className="w-full h-32 rounded-lg bg-component border-2 border-dashed border-zinc-600 overflow-hidden relative">
                    {bannerPreview ? (
                      <>
                        <img 
                          src={bannerPreview} 
                          alt="Company banner"
                          className="w-full h-full object-cover"
                        />
                        {bannerFile && (
                          <button
                            type="button"
                            onClick={() => removeFile('banner')}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8 mb-2" />
                        <p className="text-sm">No banner uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="bg-primary-green hover:bg-green-700 text-white px-4 py-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload banner
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeFile('banner')}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      Remove banner
                    </Button>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange('banner', file);
                    }}
                  />
                </div>
                {errors.banner && <p className="text-xs text-red-400">{errors.banner}</p>}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-white">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-component border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter company name"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-component border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-white">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-component border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Industry</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger className="bg-component border-zinc-600 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-component border-zinc-600">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-zinc-700"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-xs text-red-400">{errors.industry}</p>}
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Company Size</Label>
                <Select 
                  value={formData.employeeCount} 
                  onValueChange={(value) => handleInputChange('employeeCount', value)}
                >
                  <SelectTrigger className="bg-component border-zinc-600 text-white">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-component border-zinc-600">
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-zinc-700"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeCount && <p className="text-xs text-red-400">{errors.employeeCount}</p>}
              </div>

              {/* About Us */}
              <div className="space-y-2">
                <Label htmlFor="about" className="text-sm font-medium text-white">
                  About us
                </Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  className="bg-component border-zinc-600 text-white placeholder-gray-400 min-h-24 resize-none"
                  placeholder="Tell us about your company..."
                  rows={4}
                />
                {errors.about && <p className="text-xs text-red-400">{errors.about}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-6"
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-green hover:bg-green-700 text-white px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title="Unsaved Changes"
        message="Proceed with caution"
        description="You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page without saving your progress?"
        onSave={handleSaveAndStay}
        onLeave={handleLeaveWithoutSaving}
      />
    </>
  );
}