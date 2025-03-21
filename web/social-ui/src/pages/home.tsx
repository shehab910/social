import Feed from "@/components/feed";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
      <Feed />
    </div>
  );
}
