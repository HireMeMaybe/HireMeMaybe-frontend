"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Upload, ExternalLink } from "lucide-react";
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Surname */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                className="bg-darker-gray border-gray-600 text-white"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-white">Surname</Label>
              <Input
                id="surname"
                {...register("surname", { required: "Surname is required" })}
                className="bg-darker-gray border-gray-600 text-white"
              />
              {errors.surname && <p className="text-red-500">{errors.surname.message}</p>}
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                className="bg-darker-gray border-gray-600 text-white"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input
                id="phone"
                {...register("phone", { required: "Phone number is required" })}
                className="bg-darker-gray border-gray-600 text-white"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Major */}
          <div className="space-y-2">
            <Label className="text-white">Major</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  value="CPE"
                  {...register("major", { required: "Major is required" })}
                />
                CPE
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  value="SKE"
                  {...register("major", { required: "Major is required" })}
                />
                SKE
              </label>
            </div>
            {errors.major && <p className="text-red-500">{errors.major.message}</p>}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-white">Resume</Label>
            <Controller
              name="resume"
              control={control}
              rules={{ required: "Resume is required" }}
              render={({ field }) => (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-darker-gray">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {field.value ? field.value.name : "Upload File (PDF)"}
                    </p>
                  </label>
                </div>
              )}
            />
            {errors.resume && <p className="text-red-500">{errors.resume.message}</p>}
          </div>

          {/* Soft Skills */}
          <div className="space-y-2">
            <Label htmlFor="soft-skills" className="text-white">Soft Skills</Label>
            <div className="bg-darker-gray border border-gray-600 rounded-lg p-4">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="bg-darker-gray border-gray-600 text-white w-full p-2 rounded"
                onKeyDown={handleAddSoftSkill}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-green text-white px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSoftSkill(skill)}
                      className="text-white hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Default Questions */}
          {job.includeDefaultQuestions && formData.questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Questions</h3>
              {formData.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-white">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
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
                  ) : question.type === 'multiselect' ? (
                    <div className="space-y-2">
                      {question.options?.map((option) => {
                        const currentAnswers = question.answer ? question.answer.split(", ") : [];
                        const isChecked = currentAnswers.includes(option);
                        return (
                          <label key={option} className="flex items-center gap-2 text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleMultiselectChange(question.id, option, e.target.checked)}
                              className="text-primary-green"
                            />
                            {option}
                          </label>
                        );
                      })}
                    </div>
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

          {/* Custom Questions Link */}
          {job.includeCustomQuestions && job.customQuestionsLink && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Additional Questions</h3>
              <div className="bg-darker-gray border border-gray-600 rounded-lg p-4">
                <p className="text-white mb-3">
                  Please complete the additional questions for this position:
                </p>
                <Button 
                  type="button"
                  onClick={() => window.open(job.customQuestionsLink, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
                >
                  Complete Custom Questions
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

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