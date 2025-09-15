// src/features/application/components/ApplicationForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useJobs } from "@/features/search/hooks/useJobs";
import { ApplicationFormData, EDUCATION_LEVELS, PROGRAMMING_LANGUAGES } from "@/types/application";

interface ApplicationFormProps {
  jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    major: "",
    educationLevel: "",
    resume: null,
    softSkills: "",
    questions: job?.questions || [],
    programmingLanguages: PROGRAMMING_LANGUAGES.map(lang => ({
      name: lang,
      selected: false
    }))
  });

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, answer } : q
      )
    }));
  };

  const handleLanguageToggle = (langName: string) => {
    setFormData(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.map(lang =>
        lang.name === langName ? { ...lang, selected: !lang.selected } : lang
      )
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Application submitted:", formData);
    router.push("/search");
  };

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Button onClick={() => router.push("/search")} className="bg-primary-green hover:bg-green-600">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Application form</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Surname */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-darker-gray border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-white">Surname</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                className="bg-darker-gray border-gray-600 text-white"
                required
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-darker-gray border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-darker-gray border-gray-600 text-white"
                required
              />
            </div>
          </div>

          {/* Major */}
          <div className="space-y-2">
            <Label className="text-white">Major</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  name="major"
                  value="CPE"
                  checked={formData.major === "CPE"}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  className="text-primary-green"
                />
                CPE
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  name="major"
                  value="SKE"
                  checked={formData.major === "SKE"}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  className="text-primary-green"
                />
                SKE
              </label>
            </div>
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <Label htmlFor="education-level" className="text-white">Education Level</Label>
            <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange("educationLevel", value)}>
              <SelectTrigger className="bg-darker-gray border-gray-600 text-white">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent className="bg-darker-gray border-gray-600">
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level} className="text-white hover:bg-gray-700">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-white">Resume</Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-darker-gray">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">
                  {formData.resume ? formData.resume.name : "Upload File (PDF)"}
                </p>
              </label>
            </div>
          </div>

          {/* Soft Skills */}
          <div className="space-y-2">
            <Label htmlFor="soft-skills" className="text-white">Soft Skills</Label>
            <Select value={formData.softSkills} onValueChange={(value) => handleInputChange("softSkills", value)}>
              <SelectTrigger className="bg-darker-gray border-gray-600 text-white">
                <SelectValue placeholder="Communication & ..." />
              </SelectTrigger>
              <SelectContent className="bg-darker-gray border-gray-600">
                <SelectItem value="communication" className="text-white hover:bg-gray-700">Communication &amp; Teamwork</SelectItem>
                <SelectItem value="leadership" className="text-white hover:bg-gray-700">Leadership</SelectItem>
                <SelectItem value="problem-solving" className="text-white hover:bg-gray-700">Problem Solving</SelectItem>
                <SelectItem value="creativity" className="text-white hover:bg-gray-700">Creativity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Questions */}
          {formData.questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Questions</h3>
              {formData.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-white">{question.question}</Label>
                  {question.type === 'select' ? (
                    <Select 
                      value={question.answer} 
                      onValueChange={(value) => handleQuestionChange(question.id, value)}
                    >
                      <SelectTrigger className="bg-darker-gray border-gray-600 text-white">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-darker-gray border-gray-600">
                        {question.options?.map((option) => (
                          <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Textarea
                      value={question.answer}
                      onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                      className="bg-darker-gray border-gray-600 text-white"
                      rows={3}
                      required={question.required}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Programming Languages */}
          <div className="space-y-2">
            <Label className="text-white">What of the following programming languages and you experienced in?</Label>
            <div className="grid grid-cols-3 gap-2">
              {formData.programmingLanguages.map((lang) => (
                <label key={lang.name} className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lang.selected}
                    onChange={() => handleLanguageToggle(lang.name)}
                    className="text-primary-green"
                  />
                  {lang.name}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary-green hover:bg-green-600 text-white font-semibold py-3 rounded-lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}