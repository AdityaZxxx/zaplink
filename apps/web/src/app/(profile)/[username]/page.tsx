type PublicProfilePageProps = {
	params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({
	params,
}: PublicProfilePageProps) {
	const { username } = await params;
	return <h1>Public Profile: {username}</h1>;
}
