import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function App() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [todaysPic, setTodaysPic] = useState<{
    image_url: string;
    description: {
      name: string;
      artist: string;
    };
  } | null>(null);

  const addLogEntry = (message: string) => {
    setLog((prevLog) => [
      ...prevLog,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const fetchCounter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/counter`);
      const data = await response.json();
      setCount(data.counter);
      addLogEntry(
        `GET ${API_BASE_URL}/counter - Fetched counter: ${data.counter}`,
      );
    } catch (error) {
      console.error("Error fetching counter:", error);
      addLogEntry(
        `GET ${API_BASE_URL}/counter - Error fetching counter: ${error}`,
      );
    }
  };

  const incrementCounter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/counter`, {
        method: "POST",
      });
      const data = await response.json();
      setCount(data.counter);
      addLogEntry(
        `POST ${API_BASE_URL}/counter - Incremented counter: ${data.counter}`,
      );
    } catch (error) {
      console.error("Error incrementing counter:", error);
      addLogEntry(
        `POST ${API_BASE_URL}/counter - Error incrementing counter: ${error}`,
      );
    }
  };

  const fetchTodaysPic = async () => {
    try {
      console.log(`${API_BASE_URL}/todays_pic/metadata`);
      const response = await fetch(`${API_BASE_URL}/todays_pic/metadata`);
      const data = await response.json();
      setTodaysPic({
        image_url: data.image_url,
        description: data.description,
      });
      console.log(todaysPic);
      addLogEntry(`GET ${API_BASE_URL}/todays_pic - Fetched today's picture`);
    } catch (error) {
      console.error("Error fetching today's picture:", error);
      addLogEntry(
        `GET ${API_BASE_URL}/todays_pic - Error fetching picture: ${error}`,
      );
    }
  };

  useEffect(() => {
    fetchCounter();
    fetchTodaysPic();
  }, []);

  if (todaysPic) {
    console.log(`${API_BASE_URL}/images/${todaysPic.image_url}`);
  }

  return (
    <div className="bg-black text-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-8 pt-4 space-y-12">
        <section className="max-w-2xl text-center px-4">
          <p className="text-gray-400">
            This is an example of a React Frontend with a FastAPI backend on
            Replit. <br />
            Check out the code{" "}
            <a
              href="https://replit.com/@matt/Matts-Fullstack-Repl-Front-Backend?v=1"
              target="_blank"
              className="font-bold text-white hover:text-gray-200 transition-colors"
            >
              here
            </a>
            .
          </p>
        </section>

        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-white">
              Counter
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-8xl font-bold mb-8 text-white">{count}</div>
            <Button
              onClick={incrementCounter}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors"
              size="lg"
            >
              <PlusCircle className="w-5 h-5" />
              Increment
            </Button>
          </CardContent>
        </Card>

        {/* <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              API Request Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {log.map((entry, index) => (
                <li key={index} className="text-sm text-gray-400">
                  {entry}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card> */}

        {todaysPic && (
          <Card className="w-full max-w-md bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">
                Picture of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={`${API_BASE_URL}/${encodeURIComponent(todaysPic.image_url)}`}
                alt={todaysPic.description.name}
                className="w-full rounded-lg mb-4"
              />
              <p className="text-sm text-gray-400">
                {todaysPic.description.name} by {todaysPic.description.artist}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>Footer</p>
      </footer>
    </div>
  );
}

export default App;
