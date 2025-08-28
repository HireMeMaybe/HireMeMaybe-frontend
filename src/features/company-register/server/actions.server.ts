"use server";

import { companyRegisterSchema } from "@/lib/validations/company";
import type { CompanyRegistrationResult } from "@/types/company";

export async function registerCompany(formData: FormData): Promise<CompanyRegistrationResult> {
  try {
    // Parse form data
    const rawData = {
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      overview: formData.get("overview") as string,
      industry: formData.get("industry") as string,
      companySize: formData.get("companySize") as string,
      logo: formData.get("logo") as File | null,
      banner: formData.get("banner") as File | null,
    };

    // Remove null files to make them undefined for Zod validation
    const cleanedData = {
      ...rawData,
      logo: rawData.logo instanceof File && rawData.logo.size > 0 ? rawData.logo : undefined, // Ensure logo is a File
      banner: rawData.banner instanceof File && rawData.banner.size > 0 ? rawData.banner : undefined, // Ensure banner is a File
    };

    // Validate with Zod
    const result = companyRegisterSchema.safeParse(cleanedData);

    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    const validatedData = result.data;

    // Here you would typically save to your database
    // For now, we'll just simulate the process
    console.log("Validated company data:", {
      ...validatedData,
      logo: validatedData.logo ? `${validatedData.logo.name} (${validatedData.logo.size} bytes)` : null,
      banner: validatedData.banner ? `${validatedData.banner.name} (${validatedData.banner.size} bytes)` : null,
    });

    // Simulate file upload process
    if (validatedData.logo) {
      console.log("Uploading logo:", validatedData.logo.name);
    }

    if (validatedData.banner) {
      console.log("Uploading banner:", validatedData.banner.name);
    }

    // Simulate saving to database
    const companyId = `company_${Date.now()}`;
    
    // Replace this with actual database save logic
    // const company = await db.company.create({
    //   data: {
    //     name: validatedData.companyName,
    //     email: validatedData.email,
    //     phone: validatedData.phone,
    //     overview: validatedData.overview,
    //     industry: validatedData.industry,
    //     companySize: validatedData.companySize,
    //     logoUrl: logoUrl, // from file upload
    //     bannerUrl: bannerUrl, // from file upload
    //   }
    // });

    return {
      success: true,
      message: "Company registered successfully!",
      data: {
        id: companyId,
        companyName: validatedData.companyName,
      },
    };
  } catch (error) {
    console.error("Company registration error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}