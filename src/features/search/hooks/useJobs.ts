export function useJobs() {
  const jobs = [
    {
      id: 1, // Matches jobId in useJobApplications
      title: "Full Stack Developer",
      company: "OCS",
      location: "Bangkok, Thailand (Hybrid)",
      description: `We are looking for a Full Stack Developer who will be responsible for developing and maintaining scalable web applications. You will work closely with our design team to implement UI/UX best practices, as well as our backend engineers to integrate APIs and services.

Responsibilities:
- Build and maintain modern web applications using React, Node.js, and TypeScript.
- Collaborate with designers and product managers to deliver high-quality features.
- Ensure responsiveness and performance across devices.
- Write unit and integration tests to maintain reliability.
- Contribute to architecture discussions and technical decision-making.

Qualifications:
- 2+ years of professional experience in web development.
- Strong knowledge of JavaScript/TypeScript and modern frameworks.
- Experience with REST APIs, SQL/NoSQL databases, and cloud deployment.
- Familiarity with CI/CD pipelines and Git workflows.`,
      tags: ["Finance"],
      postedDate: "2025-09-01",
      logoPath: "/placeholder-logo.png",
    },
    {
      id: 2, // Matches jobId in useJobApplications
      title: "Data Scientist",
      company: "AIS Innovation Lab",
      location: "Bangkok, Thailand",
      description: `We are hiring a Data Scientist to join our advanced analytics team. You will be working on projects involving customer behavior analysis, predictive modeling, and AI-driven recommendations.

Responsibilities:
- Collect, process, and analyze large datasets to extract actionable insights.
- Build predictive models using machine learning techniques such as regression, classification, clustering, and deep learning.
- Deploy machine learning models into production environments.
- Communicate findings to stakeholders in clear and concise ways.
- Work with engineers to integrate models into products and services.

Qualifications:
- Bachelor's or Master's degree in Computer Science, Statistics, or related field.
- Strong experience with Python, TensorFlow, PyTorch, and scikit-learn.
- Familiarity with big data technologies such as Spark and Hadoop.
- Excellent problem-solving and critical-thinking skills.`,
      tags: ["Telecom"],
      postedDate: "2025-09-02",
      logoPath: "/placeholder-logo.png",
    },
    {
      id: 3, // Matches jobId in useJobApplications
      title: "UI/UX Designer",
      company: "LINE Thailand",
      location: "Bangkok, Thailand",
      description: `As a UI/UX Designer at LINE, you will work on creating user-friendly, visually appealing designs for millions of users across Thailand. You will collaborate with cross-functional teams to enhance the overall user experience.

Responsibilities:
- Conduct user research and usability testing to inform design decisions.
- Create wireframes, prototypes, and visual designs for mobile and web applications.
- Work closely with product managers and developers to implement designs.
- Ensure consistency with design systems and brand guidelines.
- Stay updated on the latest design trends and best practices.

Qualifications:
- 3+ years of experience in UI/UX design.
- Proficiency in Figma, Sketch, or Adobe XD.
- Strong portfolio showcasing user-centered design.
- Excellent communication and teamwork skills.`,
      tags: ["Technology"],
      postedDate: "2025-09-03",
      logoPath: "/placeholder-logo.png",
    },
  ];

  return { jobs };
}