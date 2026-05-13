import hero from "@/assets/chrome-typec-hero.png";
import single from "@/assets/chrome-typec-single.png";
import pair from "@/assets/chrome-typec.png";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  images: string[];
  badge?: string;
};

export const products: Product[] = [
  {
    id: "chrome-pro",
    name: "Chrome Earphones",
    tagline: "Reference-grade hybrid driver earphones with USB-C",
    price: 699,
    image: hero,
    images: [hero, single, pair],
    badge: "Flagship",
  },
  {
    id: "chrome-classic",
    name: "Chrome Classic",
    tagline: "Signature chrome sound, refined",
    price: 699,
    image: single,
    images: [single, pair, hero],
  },
  {
    id: "chrome-c",
    name: "Chrome C",
    tagline: "Plug-and-play USB Type-C earphones",
    price: 999,
    image: pair,
    images: [pair, hero, single],
    badge: "New",
  },
];

export const featured = products[0];
