import { Label } from '@/components/ui/label';

const programmingLanguages = [
  "C/C++",
  "C#",
  "HTML/CSS",
  "Java",
  "JavaScript",
  "TypeScript",
  "PHP",
  "Python",
  "Flutter"
];

export default function DefaultApplicationFormQuestions() {
  return (
    <div className="space-y-6 mt-10 mb-10">
      {/* Question 1 */}
      <div>
        <Label className="text-white">
          Which of the following statements best describes your right to work in Thailand? <span className="text-red-500">*</span>
        </Label>
        <p className="mt-2 text-gray-400">Citizen, Permanent Resident, Work Visa, Other</p>
      </div>

      {/* Question 2 */}
      <div>
        <Label className="text-white">
          What&apos;s your expected monthly basic salary? <span className="text-red-500">*</span>
        </Label>
        <p className="mt-2 text-gray-400">e.g. 50,000 THB</p>
      </div>

      {/* Question 3 */}
      <div>
        <Label className="text-white">
          How many years&apos; experience do you have as a Software Engineer? <span className="text-red-500">*</span>
        </Label>
        <p className="mt-2 text-gray-400">e.g. 5 years</p>
      </div>

      {/* Question 4 */}
      <div>
        <Label className="text-white">
          Which of the following programming languages are you experienced in? <span className="text-red-500">*</span>
        </Label>
        <ul className="mt-2 text-gray-400 space-y-1">
          {programmingLanguages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
