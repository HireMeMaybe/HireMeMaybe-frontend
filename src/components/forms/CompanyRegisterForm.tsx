"use client";

import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { companyRegisterSchema, type CompanyRegisterFormData } from "@/lib/validations/company";
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from "@/types/company";
import { registerCompany } from "@/app/company-register/actions";

export function CompanyRegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      overview: "",
      industry: "",
      companySize: "",
    },
  });

  const watchedLogo = watch("logo");
  const watchedBanner = watch("banner");

  const handleFileUpload = (field: "logo" | "banner", file: File | null) => {
    if (file) {
      setValue(field, file);
      clearErrors(field);
    } else {
      setValue(field, undefined);
    }
  };

  const onSubmit = async (data: CompanyRegisterFormData) => {
    startTransition(async () => {
      try {
        // Create FormData for server action
        const formData = new FormData();
        
        // Append all text fields
        formData.append("companyName", data.companyName);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("overview", data.overview);
        formData.append("industry", data.industry);
        formData.append("companySize", data.companySize);
        
        // Append files if they exist
        if (data.logo) {
          formData.append("logo", data.logo);
        }
        if (data.banner) {
          formData.append("banner", data.banner);
        }

        const result = await registerCompany(formData);

        if (result.success) {
          setSubmitMessage({
            type: "success",
            text: result.message,
          });
          // Optionally reset form or redirect
        } else {
          setSubmitMessage({
            type: "error",
            text: result.message,
          });

          // Set field-specific errors if they exist
          if (result.errors) {
            result.errors.forEach((error) => {
              setError(error.field as keyof CompanyRegisterFormData, {
                message: error.message,
              });
            });
          }
        }
      } catch (error) {
      console.error("Error during company registration:", error); // Log the error for debugging
      setSubmitMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    }
    });
  };

  return (
    <div className="space-y-6">
      {submitMessage && (
        <div
          className={`p-4 rounded-lg ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Logo Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Company Logo</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer text-gray-text relative">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 text-gray-text" />
            <p className="text-sm text-muted-foreground text-lighter-gray-text">Upload Image</p>
            <p className="text-xs text-muted-foreground mt-1 text-lighter-gray-text">JPG, JPEG, PNG PDF files up to 10MB</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload("logo", file);
              }}
            />
          </div>
          {watchedLogo && (
            <p className="text-sm text-muted-foreground mt-2">
              Uploaded: <span className="font-medium">{watchedLogo.name}</span>
            </p>
          )}
          {errors.logo && (
            <p className="text-sm text-red-600 mt-1">{errors.logo.message}</p>
          )}
        </div>

        {/* Company Banner Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Company Banner</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer text-gray-text relative">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 text-gray-text" />
            <p className="text-sm text-muted-foreground text-lighter-gray-text">Upload Image</p>
            <p className="text-xs text-muted-foreground mt-1 text-lighter-gray-text">JPG, JPEG, PNG PDF files up to 10MB</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload("banner", file);
              }}
            />
          </div>
          {watchedBanner && (
            <p className="text-sm text-muted-foreground mt-2">
              Uploaded: <span className="font-medium">{watchedBanner.name}</span>
            </p>
          )}
          {errors.banner && (
            <p className="text-sm text-red-reject mt-1">{errors.banner.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
            Company Name
          </Label>
          <Input
            id="companyName"
            {...register("companyName")}
            className="bg-muted border-border"
          />
          {errors.companyName && (
            <p className="text-sm text-red-reject mt-1">{errors.companyName.message}</p>
          )}
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="bg-muted border-border"
            />
            {errors.email && (
              <p className="text-sm text-red-reject mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className="bg-muted border-border"
            />
            {errors.phone && (
              <p className="text-sm text-red-reject mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <Label htmlFor="overview" className="text-sm font-medium text-foreground">
            Overview
          </Label>
          <Textarea
            id="overview"
            {...register("overview")}
            className="bg-muted border-border min-h-[120px] resize-none"
            placeholder="Tell us about your company..."
          />
          {errors.overview && (
            <p className="text-sm text-red-reject mt-1">{errors.overview.message}</p>
          )}
        </div>

        {/* Industry and Company Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Industry</Label>
            <Select
              onValueChange={(value) => {
                setValue("industry", value);
                clearErrors("industry");
              }}
            >
              <SelectTrigger className="bg-muted border-border w-full">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-dark-gray border-border">
                {INDUSTRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-reject mt-1">{errors.industry.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Company Size</Label>
            <Select
              onValueChange={(value) => {
                setValue("companySize", value);
                clearErrors("companySize");
              }}
            >
              <SelectTrigger className="bg-muted border-border w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-dark-gray border-border">
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companySize && (
              <p className="text-sm text-red-reject mt-1">{errors.companySize.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-primary-green hover:bg-green-600 text-white font-bold py-3"
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}