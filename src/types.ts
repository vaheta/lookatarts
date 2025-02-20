export type MeditationState = "idle" | "meditating" | "completed";

export type TodaysPic = {
  image_url: string;
  description: {
    name: string;
    artist: string;
    date: string;
    width: number;
    height: number;
    dimensions: string;
    link: string;
    repository: string;
    about: string;
  };
} | null; 