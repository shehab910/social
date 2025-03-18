import Header from "@/components/header";
import Feed from "@/components/feed";

function App() {
  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
        <Feed />
      </main>
    </>
  );
}

export default App;
