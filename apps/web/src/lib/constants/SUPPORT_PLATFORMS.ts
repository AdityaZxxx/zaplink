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
	/*
	 * What the field after the base URL asks for. "username" is wrong for a
	 * YouTube handle or a Spotify artist, and the field is the only place that
	 * can say so.
	 */
	inputLabel: string;
}

export const SUPPORT_PLATFORMS: Record<string, PlatformInfo> = {
	Instagram: {
		name: "Instagram",
		icon: FaInstagram,
		baseUrl: "https://instagram.com/",
		category: "social",
		inputLabel: "username",
	},
	TikTok: {
		name: "TikTok",
		icon: FaTiktok,
		baseUrl: "https://tiktok.com/@",
		category: "social",
		inputLabel: "username",
	},
	YouTube: {
		name: "YouTube",
		icon: FaYoutube,
		baseUrl: "https://youtube.com/@",
		category: "entertainment",
		inputLabel: "handle",
	},
	Spotify: {
		name: "Spotify",
		icon: FaSpotify,
		baseUrl: "https://open.spotify.com/",
		category: "music",
		inputLabel: "artist, album or playlist",
	},
	X: {
		name: "X",
		icon: FaXTwitter,
		baseUrl: "https://x.com/",
		category: "social",
		inputLabel: "username",
	},
	Reddit: {
		name: "Reddit",
		icon: FaReddit,
		baseUrl: "https://reddit.com/",
		category: "social",
		inputLabel: "username",
	},
	Facebook: {
		name: "Facebook",
		icon: FaFacebook,
		baseUrl: "https://facebook.com/",
		category: "social",
		inputLabel: "username or page name",
	},
	Threads: {
		name: "Threads",
		icon: FaThreads,
		baseUrl: "https://threads.net/@",
		category: "social",
		inputLabel: "handle",
	},
	AppleMusic: {
		name: "Apple Music",
		icon: SiApplemusic,
		baseUrl: "https://music.apple.com/us/album/",
		category: "music",
		inputLabel: "album name",
	},
	Telegram: {
		name: "Telegram",
		icon: FaTelegram,
		baseUrl: "https://t.me/",
		category: "business",
		inputLabel: "username",
	},
	Discord: {
		name: "Discord",
		icon: FaDiscord,
		baseUrl: "https://discord.com/",
		category: "social",
		inputLabel: "username",
	},
	Twitch: {
		name: "Twitch",
		icon: FaTwitch,
		baseUrl: "https://twitch.tv/",
		category: "entertainment",
		inputLabel: "channel name",
	},
	OnlyFans: {
		name: "OnlyFans",
		icon: SiOnlyfans,
		baseUrl: "https://onlyfans.com/",
		category: "lifestyle",
		inputLabel: "username",
	},
	Patreon: {
		name: "Patreon",
		icon: FaPatreon,
		baseUrl: "https://patreon.com/",
		category: "lifestyle",
		inputLabel: "page name",
	},
	YoutubeMusic: {
		name: "Youtube Music",
		icon: SiYoutubemusic,
		baseUrl: "https://music.youtube.com/",
		category: "music",
		inputLabel: "channel or playlist",
	},
} as const;

/*
 * Written out rather than produced with a CSS capitalize: the value is data, and
 * a reader of the markup should not have to know a stylesheet is decorating it.
 */
export const PLATFORM_CATEGORY_LABELS: Record<PlatformCategory, string> = {
	social: "Social",
	business: "Business",
	music: "Music",
	entertainment: "Entertainment",
	lifestyle: "Lifestyle",
	news: "News",
};
