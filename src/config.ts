export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const MEDITATION_DURATIONS = [
  { value: "300", label: "5 minutes" },
  { value: "600", label: "10 minutes" },
  { value: "900", label: "15 minutes" },
] as const;

export const DEFAULT_PIC = {
  image_url: "images/artwork_20.jpg",
  description: {
    artist: "Albert Bierstadt",
    name: "The Rocky Mountains, Lander's Peak",
    date: "1863",
    width: 3811,
    height: 2284,
    dimensions: "73 1/2 x 120 3/4 in. (186.7 x 306.7 cm)",
    link: "http://www.metmuseum.org/art/collection/search/10154",
    repository: "Metropolitan Museum of Art, New York, NY",
    about: "This and other popular canvases by the German-born Albert Bierstadt shaped the visual identity of the American West in the United States and abroad. In early 1859 he accompanied a government survey expedition, headed by Frederick W. Lander, to the Nebraska Territory. By summer, the party had reached the Wind River Range of the Rocky Mountains in present-day Wyoming. Painted in New York after Bierstadt's return from these travels, this work advertised the landscape as a frontier destined to be claimed by White settlers, according to the doctrine of Manifest Destiny. This belief that Americans were the divinely ordained \"masters\" of the continent systematically ignored with dire consequences the presence of Indigenous populations, such as the Shoshone peoples depicted in the picture's foreground. Publicly exhibited to great acclaim, this monumental painting established Bierstadt as a key competitor of the preeminent landscape painter, Frederic Edwin Church (see, for example, 09.95). It was purchased in 1865 for the then-astounding sum of $25,000 by James McHenry, an American living in London. Bierstadt later bought it back and gave or sold it to his brother Edward.",
  },
}; 