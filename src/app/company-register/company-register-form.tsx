"use client";

import type React from "react";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { Label } from "src/components/ui/label";

export function CompanyRegisterForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    overview: "",
    industry: "",
    companySize: "",
    logo: null as File | null,
    banner: null as File | null,
  });

  const handleFileUpload = (field: "logo" | "banner", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    console.log(`${field} uploaded:`, file);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Logo Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Company Logo</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer text-gray-text relative">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 text-gray-text" />
          <p className="text-sm text-muted-foreground text-gray-text">Upload Image</p>
          <p className="text-xs text-muted-foreground mt-1 text-gray-text">JPG, JPEG, PNG PDF files up to 10MB</p>
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
        {/* Display uploaded file name */}
        {formData.logo && (
          <p className="text-sm text-muted-foreground mt-2">
            Uploaded : <span className="font-medium">{formData.logo.name}</span>
          </p>
        )}
      </div>

      {/* Company Banner Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Company Banner</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer text-gray-text relative">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 text-gray-text" />
          <p className="text-sm text-muted-foreground text-gray-text">Upload Image</p>
          <p className="text-xs text-muted-foreground mt-1 text-gray-text">JPG, JPEG, PNG PDF files up to 10MB</p>
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
        {/* Display uploaded file name */}
        {formData.banner && (
          <p className="text-sm text-muted-foreground mt-2">
            Uploaded : <span className="font-medium">{formData.banner.name}</span>
          </p>
        )}
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
          Company Name
        </Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange("companyName", e.target.value)}
          className="bg-muted border-border"
        />
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
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="bg-muted border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="bg-muted border-border"
          />
        </div>
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <Label htmlFor="overview" className="text-sm font-medium text-foreground">
          Overview
        </Label>
        <Textarea
          id="overview"
          value={formData.overview}
          onChange={(e) => handleInputChange("overview", e.target.value)}
          className="bg-muted border-border min-h-[120px] resize-none"
          placeholder="Tell us about your company..."
        />
      </div>

      {/* Industry and Company Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Industry</Label>
          <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
            <SelectTrigger className="bg-muted border-border w-full">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-dark-gray border-border">
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Company Size</Label>
          <Select value={formData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
            <SelectTrigger className="bg-muted border-border w-full">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="bg-dark-gray border-border">
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-primary-green hover:bg-green-600 text-white font-bold py-3">
        Submit
      </Button>
    </form>
  );
}