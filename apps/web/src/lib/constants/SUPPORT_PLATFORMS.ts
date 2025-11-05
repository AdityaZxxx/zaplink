import {
	FaDiscord,
	FaFacebook,
	FaInstagram,
	FaPatreon,
	FaReddit,
	FaSpotify,
	FaTelegram,
	FaTiktok,
	FaTwitch,
	FaYoutube,
} from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { SiApplemusic, SiOnlyfans, SiYoutubemusic } from "react-icons/si";

export type PlatformCategory =
	| "social"
	| "business"
	| "music"
	| "entertainment"
	| "lifestyle"
	| "news";

export interface PlatformInfo {
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	baseUrl: string;
	category: PlatformCategory;
}

export const SUPPORT_PLATFORMS: Record<string, PlatformInfo> = {
	Instagram: {
		name: "Instagram",
		icon: FaInstagram,
		baseUrl: "https://instagram.com/",
		category: "social",
	},
	TikTok: {
		name: "TikTok",
		icon: FaTiktok,
		baseUrl: "https://tiktok.com/@",
		category: "social",
	},
	YouTube: {
		name: "YouTube",
		icon: FaYoutube,
		baseUrl: "https://youtube.com/@",
		category: "entertainment",
	},
	Spotify: {
		name: "Spotify",
		icon: FaSpotify,
		baseUrl: "https://open.spotify.com/",
		category: "music",
	},
	X: {
		name: "X",
		icon: FaXTwitter,
		baseUrl: "https://x.com/",
		category: "social",
	},
	Reddit: {
		name: "Reddit",
		icon: FaReddit,
		baseUrl: "https://reddit.com/",
		category: "social",
	},
	Facebook: {
		name: "Facebook",
		icon: FaFacebook,
		baseUrl: "https://facebook.com/",
		category: "social",
	},
	Threads: {
		name: "Threads",
		icon: FaThreads,
		baseUrl: "https://threads.net/@",
		category: "social",
	},
	AppleMusic: {
		name: "Apple Music",
		icon: SiApplemusic,
		baseUrl: "https://music.apple.com/us/album/",
		category: "music",
	},
	Telegram: {
		name: "Telegram",
		icon: FaTelegram,
		baseUrl: "https://t.me/",
		category: "business",
	},
	Discord: {
		name: "Discord",
		icon: FaDiscord,
		baseUrl: "https://discord.com/",
		category: "social",
	},
	Twitch: {
		name: "Twitch",
		icon: FaTwitch,
		baseUrl: "https://twitch.tv/",
		category: "entertainment",
	},
	OnlyFans: {
		name: "OnlyFans",
		icon: SiOnlyfans,
		baseUrl: "https://onlyfans.com/",
		category: "lifestyle",
	},
	Patreon: {
		name: "Patreon",
		icon: FaPatreon,
		baseUrl: "https://patreon.com/",
		category: "lifestyle",
	},
	YoutubeMusic: {
		name: "Youtube Music",
		icon: SiYoutubemusic,
		baseUrl: "https://music.youtube.com/",
		category: "music",
	},
} as const;
