export type QuestionType = "text" | "single" | "multi" | "episode-search";

export interface SurveyQuestion {
  id: keyof SurveyAnswers;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

export interface SurveyAnswers {
  nickname: string;
  age_group: string;
  gender: string;
  industry: string;
  platforms: string[];
  frequency: string;
  discovery: string;
  favorite_episode: string;
  message: string;
}

export const EMPTY_ANSWERS: SurveyAnswers = {
  nickname: "",
  age_group: "",
  gender: "",
  industry: "",
  platforms: [],
  frequency: "",
  discovery: "",
  favorite_episode: "",
  message: "",
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "nickname",
    label: "What should we call you?",
    type: "text",
    placeholder: "Your nickname (shown on the map)…",
    required: false,
    hint: "Optional — stays in your browser only",
  },
  {
    id: "age_group",
    label: "How old are you?",
    type: "single",
    options: ["<18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"],
    required: true,
  },
  {
    id: "gender",
    label: "What is your gender?",
    type: "single",
    options: ["Male", "Female", "Non-binary", "Prefer not to say"],
    required: false,
  },
  {
    id: "industry",
    label: "What is your occupation / industry?",
    type: "single",
    options: [
      "Technology",
      "Finance / Investing",
      "Healthcare",
      "Consulting",
      "Education / Research",
      "Legal",
      "Media / Entertainment",
      "Marketing / Sales",
      "Student",
      "Entrepreneur / Founder",
      "Other",
    ],
    required: false,
  },
  {
    id: "platforms",
    label: "How do you listen to Acquired?",
    type: "multi",
    options: ["Spotify", "Apple Podcasts", "YouTube", "Pocket Casts", "Overcast", "Other"],
    hint: "Select all that apply",
    required: false,
  },
  {
    id: "frequency",
    label: "How often do you listen?",
    type: "single",
    options: ["Every episode", "Most episodes", "Occasionally", "Binge-listener"],
    required: false,
  },
  {
    id: "discovery",
    label: "How did you discover Acquired?",
    type: "single",
    options: [
      "Friend / colleague",
      "Social media",
      "Newsletter",
      "Podcast charts",
      "Another podcast",
      "Search / Google",
      "Can't remember",
    ],
    required: false,
  },
  {
    id: "favorite_episode",
    label: "What's your favorite episode?",
    type: "episode-search",
    placeholder: "Search episodes…",
    required: false,
  },
  {
    id: "message",
    label: "A short message to fellow listeners",
    type: "text",
    placeholder: "Say something to the community…",
    required: false,
    hint: "This may be shown publicly (anonymised)",
  },
];
