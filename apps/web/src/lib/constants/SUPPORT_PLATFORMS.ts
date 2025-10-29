import { FaInstagram, FaSpotify, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default {
	instagram: {
		name: "Instagram",
		icon: FaInstagram,
		baseUrl: "https://instagram.com/",
	},
	tiktok: {
		name: "TikTok",
		icon: FaTiktok,
		baseUrl: "https://tiktok.com/@",
	},
	youtube: {
		name: "YouTube",
		icon: FaYoutube,
		baseUrl: "https://youtube.com/",
	},
	spotify: {
		name: "Spotify",
		icon: FaSpotify,
		baseUrl: "https://open.spotify.com/",
	},
	twitter: {
		name: "X",
		icon: FaXTwitter,
		baseUrl: "https://x.com/",
	},
} as const;
