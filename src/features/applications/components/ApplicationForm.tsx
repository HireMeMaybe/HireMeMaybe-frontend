"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Upload, ExternalLink, User, Mail, Phone, GraduationCap, BookOpen, FileText, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useJobs } from "@/features/search/hooks/useJobs";
import { ApplicationFormData, EDUCATION_LEVELS, DEFAULT_QUESTIONS } from "@/types/application";

interface ApplicationFormProps {
  jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);

  const getInitialQuestions = () => {
    if (!job) return [];
    const questions = [];
    if (job.includeDefaultQuestions) {
      questions.push(...DEFAULT_QUESTIONS);
    }
    return questions;
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      major: "",
      educationLevel: "",
      resume: null,
      softSkills: [],
      questions: getInitialQuestions(),
    },
  });

  const softSkills = watch("softSkills");
  const formData = watch();

  const handleAddSoftSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newSkill = e.currentTarget.value.trim();
      if (!softSkills.includes(newSkill)) {
        setValue("softSkills", [...softSkills, newSkill]);
      }
      e.currentTarget.value = ""; // Clear the input field
    }
  };

  const handleRemoveSoftSkill = (skill: string) => {
    setValue("softSkills", softSkills.filter((s) => s !== skill));
  };

  const handleQuestionChange = (id: string, value: string) => {
    const updatedQuestions = formData.questions.map((q) =>
      q.id === id ? { ...q, answer: value } : q
    );
    setValue("questions", updatedQuestions);
  };

  const handleMultiselectChange = (id: string, option: string, checked: boolean) => {
    const updatedQuestions = formData.questions.map((q) => {
      if (q.id === id) {
        const currentAnswers = q.answer ? q.answer.split(", ") : [];
        const updatedAnswers = checked
          ? [...currentAnswers, option]
          : currentAnswers.filter((ans) => ans !== option);
        return { ...q, answer: updatedAnswers.join(", ") };
      }
      return q;
    });
    setValue("questions", updatedQuestions);
  };

  const onSubmit = (data: ApplicationFormData) => {
    console.log("Application submitted:", data);
    router.push("/search");
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Job not found</h1>
            <Button onClick={() => router.push("/search")} className="bg-primary-green hover:bg-green-600">
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-green/20 rounded-full mb-4">
              <FileText className="w-8 h-8 text-primary-green" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Application Form</h1>
            <p className="text-gray-300 text-lg">Complete your application for this position</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-green to-green-400 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Form Container */}
          <div className="bg-background border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-primary-green to-green-400 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
                </div>

                {/* Name and Surname */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-white flex items-center gap-2 text-lg font-medium">
                      <User className="w-5 h-5 text-primary-green" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      className="bg-gray-700/50 border-gray-600 rounded-xl h-14 px-4 text-white text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter your first name"
                    />
                    {errors.name && (
                      <p className="text-red-400 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="surname" className="text-white flex items-center gap-2 text-lg font-medium">
                      <User className="w-5 h-5 text-primary-green" />
                      Surname
                    </Label>
                    <Input
                      id="surname"
                      {...register("surname", { required: "Surname is required" })}
                      className="bg-gray-700/50 border-gray-600 rounded-xl h-14 px-4 text-white text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter your last name"
                    />
                    {errors.surname && (
                      <p className="text-red-400 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.surname.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-white flex items-center gap-2 text-lg font-medium">
                      <Mail className="w-5 h-5 text-primary-green" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      className="bg-gray-700/50 border-gray-600 rounded-xl h-14 px-4 text-white text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300 backdrop-blur-sm"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-white flex items-center gap-2 text-lg font-medium">
                      <Phone className="w-5 h-5 text-primary-green" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone", { required: "Phone number is required" })}
                      className="bg-gray-700/50 border-gray-600 rounded-xl h-14 px-4 text-white text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300 backdrop-blur-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-red-400 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Academic Information</h2>
                </div>

                {/* Major */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2 text-lg font-medium">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    Major
                  </Label>
                  <div className="flex gap-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                    <label className="flex items-center gap-3 text-white cursor-pointer group">
                      <input
                        type="radio"
                        value="CPE"
                        {...register("major", { required: "Major is required" })}
                        className="w-4 h-4 text-primary-green bg-gray-700 border-gray-500 focus:ring-primary-green focus:ring-2"
                      />
                      <span className="group-hover:text-primary-green transition-colors">CPE</span>
                    </label>
                    <label className="flex items-center gap-3 text-white cursor-pointer group">
                      <input
                        type="radio"
                        value="SKE"
                        {...register("major", { required: "Major is required" })}
                        className="w-4 h-4 text-primary-green bg-gray-700 border-gray-500 focus:ring-primary-green focus:ring-2"
                      />
                      <span className="group-hover:text-primary-green transition-colors">SKE</span>
                    </label>
                  </div>
                  {errors.major && (
                    <p className="text-red-400 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.major.message}
                    </p>
                  )}
                </div>

                {/* Education Level */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2 text-lg font-medium">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Education Level
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                    {EDUCATION_LEVELS.map((level) => (
                      <label key={level} className="flex items-center gap-3 text-white cursor-pointer group p-2 rounded-lg hover:bg-gray-600/30 transition-colors">
                        <input
                          type="radio"
                          value={level}
                          {...register("educationLevel", { required: "Education level is required" })}
                          className="w-4 h-4 text-primary-green bg-gray-700 border-gray-500 focus:ring-primary-green focus:ring-2"
                        />
                        <span className="group-hover:text-primary-green transition-colors">{level}</span>
                      </label>
                    ))}
                  </div>
                  {errors.educationLevel && (
                    <p className="text-red-400 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.educationLevel.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Documents</h2>
                </div>

                {/* Resume Upload */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2 text-lg font-medium">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Resume
                  </Label>
                  <Controller
                    name="resume"
                    control={control}
                    rules={{ required: "Resume is required" }}
                    render={({ field }) => (
                      <div className="border-2 border-dashed border-gray-600 hover:border-primary-green/50 rounded-xl p-8 text-center bg-gray-700/30 transition-all duration-300 hover:bg-gray-700/50">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer block">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                            <Upload className="h-8 w-8 text-purple-400" />
                          </div>
                          <p className="text-gray-300 text-lg mb-2">
                            {field.value ? (
                              <span className="text-primary-green font-medium">{field.value.name}</span>
                            ) : (
                              "Upload your resume"
                            )}
                          </p>
                          <p className="text-gray-500 text-sm">PDF, DOC, or DOCX files supported</p>
                        </label>
                      </div>
                    )}
                  />
                  {errors.resume && (
                    <p className="text-red-400 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.resume.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Skills</h2>
                </div>

                {/* Soft Skills */}
                <div className="space-y-3">
                  <Label htmlFor="soft-skills" className="text-white flex items-center gap-2 text-lg font-medium">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Soft Skills
                  </Label>
                  <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-6">
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter to add"
                      className="bg-gray-700/50 border border-gray-600 text-white w-full p-4 rounded-lg text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300"
                      onKeyDown={handleAddSoftSkill}
                    />
                    <div className="flex flex-wrap gap-3 mt-4">
                      {softSkills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-gradient-to-r from-primary-green to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSoftSkill(skill)}
                            className="text-white hover:text-red-300 transition-colors ml-1"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Questions */}
              {job.includeDefaultQuestions && formData.questions.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <h2 className="text-2xl font-semibold text-white">Questions</h2>
                  </div>
                  <div className="space-y-6">
                    {formData.questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-700/30 border border-gray-600 rounded-xl p-6">
                        <Label className="text-white text-lg font-medium mb-4 block">
                          {index + 1}. {question.question}
                          {question.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        
                        {question.type === 'select' ? (
                          <Select 
                            value={question.answer} 
                            onValueChange={(value) => handleQuestionChange(question.id, value)}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white h-12 text-base">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {question.options?.map((option) => (
                                <SelectItem key={option} value={option} className="text-white hover:bg-gray-600">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : question.type === 'multiselect' ? (
                          <div className="space-y-3">
                            {question.options?.map((option) => {
                              const currentAnswers = question.answer ? question.answer.split(", ") : [];
                              const isChecked = currentAnswers.includes(option);
                              return (
                                <label key={option} className="flex items-center gap-3 text-white cursor-pointer group p-2 rounded-lg hover:bg-gray-600/30 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleMultiselectChange(question.id, option, e.target.checked)}
                                    className="w-4 h-4 text-primary-green bg-gray-700 border-gray-500 focus:ring-primary-green focus:ring-2 rounded"
                                  />
                                  <span className="group-hover:text-primary-green transition-colors">{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <Textarea
                            value={question.answer}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="bg-gray-700/50 border-gray-600 text-white text-base focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all duration-300"
                            rows={4}
                            required={question.required}
                            placeholder="Type your answer here..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Questions Link */}
              {job.includeCustomQuestions && job.customQuestionsLink && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-2xl font-semibold text-white">Additional Questions</h2>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                    <p className="text-white mb-4 text-lg">
                      Please complete the additional questions for this position:
                    </p>
                    <Button 
                      type="button"
                      onClick={() => window.open(job.customQuestionsLink, '_blank')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Complete Custom Questions
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-8">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-green to-green-400 hover:from-green-600 hover:to-green-500 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}