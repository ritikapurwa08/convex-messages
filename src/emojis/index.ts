import emoji1 from "./angel-blushing-smile-emoji-png.png";
import emoji2 from "./face-with-tears-of-joy-emoji-png.png";
import emoji3 from "./fearful-emoji-png.png";
import emoji4 from "./love-hearts-eyes-emoji-png.png";
import emoji5 from "./sad-crying-emoji-png.png";
import emoji6 from "./smiling-face-with-sunglasses-cool-emoji-png.png";
import emoji7 from "./unamused-face-emoji-png.png";

export interface EmojisInterface {
  id: number;
  name: string;
  image: string;
}

const emojis: EmojisInterface[] = [
  {
    id: 1,
    name: "angel-blushing-smile", // Descriptive name
    image: emoji1,
  },
  {
    id: 2,
    name: "face-with-tears-of-joy",
    image: emoji2,
  },
  {
    id: 3,
    name: "fearful",
    image: emoji3,
  },
  {
    id: 4,
    name: "love-hearts-eyes",
    image: emoji4,
  },
  {
    id: 5,
    name: "sad-crying",
    image: emoji5,
  },
  {
    id: 6,
    name: "smiling-face-with-sunglasses",
    image: emoji6,
  },
  {
    id: 7,
    name: "unamused",
    image: emoji7,
  },
];

export default emojis;
