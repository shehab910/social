import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile: @{username}</h1>
      <p>This is the profile page for {username}.</p>
    </div>
  );
}
