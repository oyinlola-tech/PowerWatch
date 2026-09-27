import Icon from "./Icon";
import SectionHeading from "./SectionHeading";

const questions = [
  {
    question: "How does PowerWatch know if there is power in my area?",
    answer:
      "The status comes from people in your neighborhood. When neighbors report that power is on or off, PowerWatch shows how many people confirmed the status along with a confidence score and the time of the last update.",
  },
  {
    question: "Who can see my reports?",
    answer:
      "Your report is shared with your community so that members in your area can verify it and everyone stays informed.",
  },
  {
    question: "What happens if someone submits a false report?",
    answer:
      "Community members in your area verify reports to ensure live accuracy. False reports may affect community standing.",
  },
  {
    question: "Can I follow more than one neighborhood?",
    answer:
      "Yes. You choose a primary location when you set up the app, and you can manage your saved neighborhoods from your profile.",
  },
  {
    question: "Which phones does PowerWatch work on?",
    answer: "PowerWatch is a mobile app for Android phones and iPhone.",
  },
];

const Faq = () => (
  <section id="faq" className="scroll-mt-[72px] bg-screen px-6 py-20">
    <div className="mx-auto max-w-3xl">
      <SectionHeading
        label="FAQ"
        title="Questions, answered"
        description="The essentials about how PowerWatch works."
      />

      <div className="mt-10 space-y-4">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group rounded-xl border border-line bg-white px-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-black [&::-webkit-details-marker]:hidden">
              {question}
              <span className="flex-shrink-0 transition-transform duration-200 group-open:rotate-90">
                <Icon name="chevronRight" />
              </span>
            </summary>
            <p className="pb-4 text-sm leading-5 text-body">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;
