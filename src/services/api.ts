import { TodaysPic } from "@/types";
import { API_BASE_URL, DEFAULT_PIC } from "@/config";

export const fetchTodaysPic = async (): Promise<TodaysPic> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todays_pic/metadata`);
    if (!response.ok) {
      throw new Error('Server error');
    }
    const data = await response.json();
    return {
      image_url: data.image_url,
      description: data.description,
    };
  } catch (error) {
    console.error("Error fetching today's picture:", error);
    return DEFAULT_PIC;
  }
}; 