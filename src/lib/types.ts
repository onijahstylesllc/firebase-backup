export type Profile = {
  id: string;
  name: string;
  email: string;
  profile_picture_url: string;
  plan: 'Free' | 'Pro';
  usage: number;
  ai_preferences: {
    visualMode: boolean;
    aiTone: string;
    aiOutputFormat: string;
  };
};