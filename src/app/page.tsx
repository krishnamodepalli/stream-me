"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Home = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch("http://localhost:9999/videos/").then((res) => {
      if (res.ok) {
        res.json().then((_data) => {
          console.log(_data);
          setData(_data);
        });
      }
    });
  }, []);

  return (
    <div className="App mx-12">
      <h1 className="text-bold my-20 text-center text-4xl">
        Streaming Platform
      </h1>
      <div className="flex justify-between">
        <h3 className="text-semibold text-xl underline">Available Videos</h3>
        <Link href="/upload" className="py-3 px-6 rounded-xl text-xl bg-blue-500 text-white"> Upload</Link>
      </div>
      <ul className="my-12 ml-20 list-disc">
        {data.map((d, index) => (
          <li key={index}>
            <Link className="text-xl underline" href={`/video/${d.id}`}>Video {index + 1}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
