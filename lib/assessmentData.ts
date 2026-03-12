export type AnswerId = "A" | "B" | "C" | "D";

export type Question = {
  id: number;
  text: string;
  options: { id: AnswerId; text: string }[];
  correct: AnswerId[];
};

export type ScaleBand = {
  min: number;
  max: number;
  label: string;
  description?: string;
};

export type AssessmentTest = {
  id: "feedback" | "delegation" | "motivation" | "conflict";
  title: string;
  description: string;
  questions: Question[];
  scale: ScaleBand[];
};

export const assessmentTests: AssessmentTest[] = [
  {
    id: "feedback",
    title: "Feedback for Leaders",
    description: "Understand how to give feedback that develops people and builds trust.",
    questions: [
      {
        id: 1,
        text: "What is the main purpose of feedback from a leader?",
        options: [
          { id: "A", text: "Improving work efficiency" },
          { id: "B", text: "Demonstrating authority" },
          { id: "C", text: "Supporting employee development" },
          { id: "D", text: "Controlling discipline" },
        ],
        correct: ["A", "C"],
      },
      {
        id: 2,
        text: "Which characteristics make feedback effective?",
        options: [
          { id: "A", text: "Specificity" },
          { id: "B", text: "Timeliness" },
          { id: "C", text: "Generalization" },
          { id: "D", text: "Respectful tone" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 3,
        text: "When is the best time to provide feedback?",
        options: [
          { id: "A", text: "Immediately after the event" },
          { id: "B", text: "At a pre-scheduled time" },
          { id: "C", text: "During a stressful moment for the employee" },
          { id: "D", text: "A month later" },
        ],
        correct: ["A", "B"],
      },
      {
        id: 4,
        text: "What should be considered when giving feedback?",
        options: [
          { id: "A", text: "Individual characteristics of the employee" },
          { id: "B", text: "Leader’s personal mood" },
          { id: "C", text: "Context of the situation" },
          { id: "D", text: "Level of trust within the team" },
        ],
        correct: ["A", "C", "D"],
      },
      {
        id: 5,
        text: "Which model is most often used to structure feedback?",
        options: [
          { id: "A", text: "SWOT" },
          { id: "B", text: "SBI (Situation–Behavior–Impact)" },
          { id: "C", text: "SMART" },
          { id: "D", text: "PEST" },
        ],
        correct: ["B"],
      },
      {
        id: 6,
        text: "What should be avoided when giving feedback?",
        options: [
          { id: "A", text: "Personal judgments" },
          { id: "B", text: "Comparisons with other employees" },
          { id: "C", text: "Specific examples" },
          { id: "D", text: "Focusing on behavior" },
        ],
        correct: ["A", "B"],
      },
      {
        id: 7,
        text: "What is an indicator that feedback was received constructively?",
        options: [
          { id: "A", text: "The employee immediately agreed with all the comments" },
          {
            id: "B",
            text: "The employee asked clarifying questions, shared their perspective, and formulated specific next steps",
          },
          { id: "C", text: "The employee expressed gratitude and ended the conversation" },
          { id: "D", text: "The employee asked for time to reflect without taking further initiative" },
        ],
        correct: ["B"],
      },
      {
        id: 8,
        text: "What helps employees accept feedback?",
        options: [
          { id: "A", text: "Trusting relationships" },
          { id: "B", text: "Clear arguments" },
          { id: "C", text: "Respectful tone" },
          { id: "D", text: "Ultimatum demands" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 9,
        text: "Which feedback format is most effective for behavior correction in the short term?",
        options: [
          { id: "A", text: "Annual competency assessment" },
          {
            id: "B",
            text: "Here-and-now feedback shortly after the event, focused on observable actions",
          },
          { id: "C", text: "Written quarterly report with HR recommendations" },
          {
            id: "D",
            text: "Discussion at a team retrospective without highlighting individual points",
          },
        ],
        correct: ["B"],
      },
      {
        id: 10,
        text: "What mistakes do leaders most often make when giving feedback?",
        options: [
          { id: "A", text: "Too general statements" },
          { id: "B", text: "Lack of specific examples" },
          { id: "C", text: "Focusing only on the negative" },
          { id: "D", text: "Using the SBI model" },
        ],
        correct: ["A", "B", "C"],
      },
    ],
    scale: [
      { min: 0, max: 2, label: "Beginner", description: "Minimal knowledge, requires basic training." },
      { min: 3, max: 4, label: "Developing", description: "Fragmented knowledge, needs systematization and mentoring." },
      { min: 5, max: 6, label: "Professional", description: "Good understanding of principles, able to apply them in most situations." },
      {
        min: 7,
        max: 8,
        label: "Advanced Professional",
        description: "Confident use of feedback tools, adapts style to employees, builds openness.",
      },
      {
        min: 9,
        max: 10,
        label: "Expert",
        description: "Mastery of feedback theory and practice, uses it strategically to develop and motivate the team.",
      },
    ],
  },
  {
    id: "delegation",
    title: "Delegating Tasks for Leaders",
    description: "Check how effectively you delegate and develop ownership in the team.",
    questions: [
      {
        id: 1,
        text: "What is meant by “delegation of responsibility” as opposed to “delegation of a task”?",
        options: [
          {
            id: "A",
            text: "Transferring only execution functions while the manager remains accountable for reporting",
          },
          {
            id: "B",
            text: "Transferring decision rights within boundaries, with responsibility for the result while the manager remains accountable",
          },
          { id: "C", text: "Completely removing oneself from the task without further involvement" },
          { id: "D", text: "Transferring a task with a requirement for a weekly report on every step" },
        ],
        correct: ["B"],
      },
      {
        id: 2,
        text: "Which tasks are best suited for delegation?",
        options: [
          { id: "A", text: "Routine and repetitive tasks" },
          { id: "B", text: "Strategic decisions" },
          { id: "C", text: "Tasks that develop employees’ competencies" },
          { id: "D", text: "Leader’s personal responsibilities" },
        ],
        correct: ["A", "C"],
      },
      {
        id: 3,
        text: "What should be considered when choosing an employee for delegation?",
        options: [
          { id: "A", text: "Level of competencies" },
          { id: "B", text: "Motivation" },
          { id: "C", text: "Leader’s personal preferences" },
          { id: "D", text: "Employee’s workload" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 4,
        text: "Which stage do inexperienced managers most often skip, leading to missed deadlines?",
        options: [
          { id: "A", text: "Selecting the assignee" },
          {
            id: "B",
            text: "Clear alignment on expected result, success criteria, and scope of authority",
          },
          { id: "C", text: "Setting a deadline" },
          { id: "D", text: "Documenting the agreements in writing" },
        ],
        correct: ["B"],
      },
      {
        id: 5,
        text: "What is a sign of micromanagement as the opposite of effective delegation?",
        options: [
          { id: "A", text: "Regular weekly project status meetings" },
          {
            id: "B",
            text: "Controlling the process instead of the result: constant check-ins and approvals for minor decisions",
          },
          { id: "C", text: "Using digital task trackers for progress transparency" },
          { id: "D", text: "Providing feedback upon completion of a stage" },
        ],
        correct: ["B"],
      },
      {
        id: 6,
        text: "Which mistake is common in delegation?",
        options: [
          { id: "A", text: "Lack of authority for the employee" },
          { id: "B", text: "Too vague instructions" },
          { id: "C", text: "Delegating only simple tasks" },
          { id: "D", text: "Clear distribution of responsibility" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 7,
        text: "How does delegation affect the team?",
        options: [
          { id: "A", text: "Increases engagement" },
          { id: "B", text: "Develops employees’ skills" },
          { id: "C", text: "Reduces trust" },
          { id: "D", text: "Builds a culture of responsibility" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 8,
        text: "What should a leader do after delegating a task?",
        options: [
          { id: "A", text: "Provide resources" },
          { id: "B", text: "Set checkpoints" },
          { id: "C", text: "Completely forget about the task" },
          { id: "D", text: "Support the employee when needed" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 9,
        text: "Which tasks are not recommended for delegation?",
        options: [
          { id: "A", text: "Strategic decisions" },
          { id: "B", text: "Confidential matters" },
          { id: "C", text: "Tasks requiring leader’s accountability" },
          { id: "D", text: "Routine processes" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 10,
        text: "What role does delegation play in leader development?",
        options: [
          { id: "A", text: "Frees time for strategic tasks" },
          { id: "B", text: "Increases management efficiency" },
          { id: "C", text: "Reduces authority" },
          { id: "D", text: "Develops mentoring skills" },
        ],
        correct: ["A", "B", "D"],
      },
    ],
    scale: [
      { min: 0, max: 2, label: "Beginner", description: "Delegation is rare or ineffective. Requires basic training." },
      {
        min: 3,
        max: 4,
        label: "Developing",
        description: "Understands some aspects of delegation but applies them inconsistently.",
      },
      {
        min: 5,
        max: 6,
        label: "Professional",
        description: "Confidently applies the basics of delegation, distributes tasks effectively, supports employees.",
      },
      {
        min: 7,
        max: 8,
        label: "Advanced Professional",
        description: "Delegates effectively, develops the team, builds trust and responsibility culture.",
      },
      {
        min: 9,
        max: 10,
        label: "Expert",
        description: "Uses delegation strategically, combines trust with control, develops employees and leadership capacity.",
      },
    ],
  },
  {
    id: "motivation",
    title: "Employee Motivation for Leaders",
    description: "Assess your understanding of intrinsic and extrinsic motivation drivers.",
    questions: [
      {
        id: 1,
        text: "What is the main purpose of employee motivation?",
        options: [
          { id: "A", text: "Increasing productivity" },
          { id: "B", text: "Retaining employees" },
          { id: "C", text: "Creating a positive atmosphere" },
          { id: "D", text: "Increasing control" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 2,
        text: "Which approach best aligns with intrinsic motivation (Daniel Pink)?",
        options: [
          { id: "A", text: "A bonus system based on KPI fulfillment" },
          { id: "B", text: "Providing autonomy, mastery, and purpose in the work" },
          { id: "C", text: "Public recognition of Employees of the Month" },
          { id: "D", text: "A transparent system of grades and career progression" },
        ],
        correct: ["B"],
      },
      {
        id: 3,
        text: "Which factors belong to extrinsic motivation?",
        options: [
          { id: "A", text: "Bonuses and rewards" },
          { id: "B", text: "Peer recognition" },
          { id: "C", text: "Working conditions" },
          { id: "D", text: "Personal satisfaction" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 4,
        text: "What should be considered when designing a motivation system?",
        options: [
          { id: "A", text: "Individual employee needs" },
          { id: "B", text: "Company goals" },
          { id: "C", text: "Leader’s personal mood" },
          { id: "D", text: "Organizational culture" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 5,
        text: "What does the crowding-out effect mean in motivation?",
        options: [
          { id: "A", text: "A decrease in productivity as the team size increases" },
          {
            id: "B",
            text: "A decrease in intrinsic motivation when excessive extrinsic incentives are introduced",
          },
          { id: "C", text: "Loss of loyalty due to frequent changes in leadership" },
          { id: "D", text: "Reduced engagement due to task overload" },
        ],
        correct: ["B"],
      },
      {
        id: 6,
        text: "What is a key element of non-material motivation?",
        options: [
          { id: "A", text: "Recognition of achievements" },
          { id: "B", text: "Salary increase" },
          { id: "C", text: "Additional bonuses" },
          { id: "D", text: "Respect and trust" },
        ],
        correct: ["A", "D"],
      },
      {
        id: 7,
        text: "Which mistake is common in employee motivation?",
        options: [
          { id: "A", text: "Universal approach to everyone" },
          { id: "B", text: "Ignoring individual differences" },
          { id: "C", text: "Focusing only on money" },
          { id: "D", text: "Using diverse tools" },
        ],
        correct: ["A", "B", "C"],
      },
      {
        id: 8,
        text: "How does motivation affect the team?",
        options: [
          { id: "A", text: "Increases engagement" },
          { id: "B", text: "Reduces turnover" },
          { id: "C", text: "Decreases trust" },
          { id: "D", text: "Develops competencies" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 9,
        text: "What is the primary limitation of financial motivation?",
        options: [
          { id: "A", text: "High cost for the company budget" },
          {
            id: "B",
            text: "Habituation and the need to constantly increase incentives to maintain the effect",
          },
          { id: "C", text: "Impossibility of objectively assessing each employee's contribution" },
          { id: "D", text: "Conflicts within the team due to bonus inequality" },
        ],
        correct: ["B"],
      },
      {
        id: 10,
        text: "What is meant by an employee's motivation profile?",
        options: [
          { id: "A", text: "Salary level and benefits package" },
          {
            id: "B",
            text: "An individual mix of intrinsic and extrinsic drivers, values, and work preferences",
          },
          { id: "C", text: "Results of the latest 360-degree assessment" },
          { id: "D", text: "Tenure and career trajectory within the company" },
        ],
        correct: ["B"],
      },
    ],
    scale: [
      { min: 0, max: 2, label: "Beginner" },
      { min: 3, max: 4, label: "Developing" },
      { min: 5, max: 6, label: "Professional" },
      { min: 7, max: 8, label: "Advanced Professional" },
      { min: 9, max: 10, label: "Expert" },
    ],
  },
  {
    id: "conflict",
    title: "Conflict Management for Leaders",
    description: "Measure your conflict-resolution fundamentals and emotional intelligence skills.",
    questions: [
      {
        id: 1,
        text: "What is the primary goal of conflict management in a team?",
        options: [
          { id: "A", text: "Preventing disagreements completely" },
          { id: "B", text: "Resolving disputes constructively" },
          { id: "C", text: "Strengthening collaboration" },
          { id: "D", text: "Demonstrating authority" },
        ],
        correct: ["B", "C"],
      },
      {
        id: 2,
        text: "Which approaches are considered effective in conflict resolution?",
        options: [
          { id: "A", text: "Active listening" },
          { id: "B", text: "Avoidance of the issue" },
          { id: "C", text: "Seeking win–win solutions" },
          { id: "D", text: "Clear communication" },
        ],
        correct: ["A", "C", "D"],
      },
      {
        id: 3,
        text: "What should a leader avoid during conflict management?",
        options: [
          { id: "A", text: "Taking sides prematurely" },
          { id: "B", text: "Using personal attacks" },
          { id: "C", text: "Focusing on behaviors, not personalities" },
          { id: "D", text: "Escalating emotions" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 4,
        text: "Which conflict resolution style emphasizes cooperation and mutual benefit?",
        options: [
          { id: "A", text: "Competing" },
          { id: "B", text: "Collaborating" },
          { id: "C", text: "Avoiding" },
          { id: "D", text: "Accommodating" },
        ],
        correct: ["B"],
      },
      {
        id: 5,
        text: "What is the first step in managing a conflict?",
        options: [
          { id: "A", text: "Identifying the root cause" },
          { id: "B", text: "Assigning blame" },
          { id: "C", text: "Ignoring the situation" },
          { id: "D", text: "Imposing a solution immediately" },
        ],
        correct: ["A"],
      },
      {
        id: 6,
        text: "What is meant by active listening in conflict resolution?",
        options: [
          { id: "A", text: "Remaining silent while the opponent is speaking" },
          { id: "B", text: "Paraphrasing, clarifying, and reflecting feelings to confirm understanding" },
          { id: "C", text: "Writing down the speaker's key points" },
          { id: "D", text: "Preparing counterarguments while the speaker is talking" },
        ],
        correct: ["B"],
      },
      {
        id: 7,
        text: "How can conflicts positively impact a team?",
        options: [
          { id: "A", text: "Stimulate innovation" },
          { id: "B", text: "Strengthen relationships" },
          { id: "C", text: "Increase stress" },
          { id: "D", text: "Improve problem-solving" },
        ],
        correct: ["A", "B", "D"],
      },
      {
        id: 8,
        text: "What is emotional intelligence in the context of conflict management?",
        options: [
          {
            id: "A",
            text: "The ability to suppress one's emotions for the sake of the task",
          },
          {
            id: "B",
            text: "The ability to recognize and regulate emotions (one's own and others') for constructive dialogue",
          },
          { id: "C", text: "A technique for rapid stress relief before a difficult conversation" },
          { id: "D", text: "The skill of reasoned persuasion without raising one's voice" },
        ],
        correct: ["B"],
      },
      {
        id: 9,
        text: "What is an indicator that a conflict is escalating into a destructive phase?",
        options: [
          { id: "A", text: "Raising the tone of one's voice" },
          {
            id: "B",
            text: "Shifting from discussing the problem to personal attacks and generalizations",
          },
          { id: "C", text: "Involving witnesses to the situation" },
          { id: "D", text: "Refusing a one-on-one meeting" },
        ],
        correct: ["B"],
      },
      {
        id: 10,
        text: "What is the main sign of a constructive conflict?",
        options: [
          { id: "A", text: "Complete absence of emotions" },
          { id: "B", text: "Focus on the problem rather than the person" },
          { id: "C", text: "Quick resolution of the dispute" },
          { id: "D", text: "Involvement of a third party" },
        ],
        correct: ["B"],
      },
    ],
    scale: [
      {
        min: 0,
        max: 2,
        label: "Beginner",
        description: "Limited understanding of conflict management, tends to avoid or mishandle disputes.",
      },
      {
        min: 3,
        max: 4,
        label: "Developing",
        description: "Recognizes some principles but applies them inconsistently. Needs structured training.",
      },
      {
        min: 5,
        max: 6,
        label: "Professional",
        description: "Handles most conflicts effectively, applies constructive techniques, maintains team stability.",
      },
      {
        min: 7,
        max: 8,
        label: "Advanced Professional",
        description: "Confidently manages conflicts, fosters collaboration, uses conflicts as opportunities for growth.",
      },
      {
        min: 9,
        max: 10,
        label: "Expert",
        description: "Masterfully integrates conflict management into leadership, builds resilient teams.",
      },
    ],
  },
];

export const getScaleBand = (test: AssessmentTest, score: number) => {
  return test.scale.find((band) => score >= band.min && score <= band.max) ?? test.scale[0];
};
