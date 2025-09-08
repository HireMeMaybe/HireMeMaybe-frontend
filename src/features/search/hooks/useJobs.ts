function generateMockJobs(count: number) {
    const baseJobs = [
    {
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
    - Familiarity with CI/CD pipelines and Git workflows.
    
        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Finance", "Posted 2 days ago"],
        logoPath: "/placeholder-logo.png",
    },
    {
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
    - Bachelor’s or Master’s degree in Computer Science, Statistics, or related field.
    - Strong experience with Python, TensorFlow, PyTorch, and scikit-learn.
    - Familiarity with big data technologies such as Spark and Hadoop.
    - Excellent problem-solving and critical-thinking skills.
    
        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Telecom", "Posted 1 week ago"],
        logoPath: "/placeholder-logo.png",
    },
    {
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
    - Excellent communication and teamwork skills.
    
        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Technology", "Posted 3 days ago"],
        logoPath: "/placeholder-logo.png",
    },
    {
        title: "Cloud Engineer",
        company: "SCB TechX",
        location: "Bangkok, Thailand (Remote-Friendly)",
        description: `We are seeking a Cloud Engineer to design, build, and maintain our cloud infrastructure. You will play a key role in ensuring the scalability, reliability, and security of our cloud-native applications.

    Responsibilities:
    - Design and implement cloud infrastructure on AWS and GCP.
    - Automate infrastructure deployment with Terraform and Ansible.
    - Monitor and optimize system performance and cost efficiency.
    - Implement best practices for cloud security and compliance.
    - Collaborate with developers to ensure smooth CI/CD pipelines.

    Qualifications:
    - Bachelor’s degree in Computer Science, Engineering, or related field.
    - Strong knowledge of AWS/GCP cloud services.
    - Experience with Docker, Kubernetes, and serverless architecture.
    - Familiarity with DevOps practices and tools (Jenkins, GitHub Actions).
    
        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Banking", "Posted 5 days ago"],
        logoPath: "/placeholder-logo.png",
    },
    {
        title: "Mobile App Developer (iOS/Android)",
        company: "Grab",
        location: "Bangkok, Thailand",
        description: `Grab is looking for a Mobile App Developer who is passionate about creating high-performance applications. You will join our engineering team to build new features and improve existing ones for millions of users.

    Responsibilities:
    - Develop and maintain native iOS (Swift) or Android (Kotlin) applications.
    - Collaborate with product managers and designers to deliver seamless user experiences.
    - Optimize applications for maximum speed and scalability.
    - Implement security best practices to protect user data.
    - Troubleshoot and debug complex issues.

    Qualifications:
    - 2+ years of experience in mobile development.
    - Strong knowledge of Swift (iOS) or Kotlin (Android).
    - Familiarity with mobile architecture patterns (MVVM, Clean Architecture).
    - Experience with REST APIs and Firebase services.

        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Ride-hailing", "Posted 4 days ago"],
        logoPath: "/placeholder-logo.png",
    },
    {
        title: "Cybersecurity Analyst",
        company: "True Digital Group",
        location: "Bangkok, Thailand",
        description: `We are hiring a Cybersecurity Analyst to strengthen our security operations center. You will be responsible for identifying, analyzing, and responding to security threats in real-time.

    Responsibilities:
    - Monitor network traffic for suspicious activities.
    - Perform vulnerability assessments and penetration testing.
    - Investigate and respond to security incidents.
    - Collaborate with IT teams to enforce security policies.
    - Document incidents and recommend improvements.

    Qualifications:
    - Bachelor’s degree in IT, Cybersecurity, or related field.
    - Familiarity with SIEM tools (Splunk, ELK, QRadar).
    - Knowledge of firewalls, IDS/IPS, and endpoint security.
    - Strong analytical and problem-solving skills.
    
        Responsibilities:
    - Build and maintain modern web applications using React, Node.js, and TypeScript.
    - Collaborate with designers and product managers to deliver high-quality features.
    - Ensure responsiveness and performance across devices.
    - Write unit and integration tests to maintain reliability.
    - Contribute to architecture discussions and technical decision-making.`,
        tags: ["Security", "Posted 1 week ago"],
        logoPath: "/placeholder-logo.png",
    },
];

  return Array.from({ length: count }, (_, i) => {
    const job = baseJobs[i % baseJobs.length];
    return {
      id: i + 1,
      ...job,
      title: `${job.title} #${i + 1}`,
      logoPath: "/placeholder-logo.png",
    };
  });
}

export function useJobs() {
  const jobs = generateMockJobs(30);
  return { jobs };
}
