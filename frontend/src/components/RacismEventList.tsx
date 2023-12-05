import React, { useEffect, useState } from "react";
import { fetchRacismData } from "../services/racismDataService";
import styles from "./RacismEventList.module.css";

interface RacismData {
  title: string;
  source: string;
  url: string;
  date: Date;
}

const RacismEventList: React.FC = () => {
  const [data, setData] = useState<RacismData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchRacismData();
      setData(result);
    };

    // Fetch data initially
    fetchData();

    // Set up an interval to fetch data every hour (3600000 milliseconds)
    const interval = setInterval(fetchData, 3600000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.listContainer}>
      <h1>Racism in the Premier League</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title} - {item.source} (
              {new Date(item.date).toLocaleDateString()})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RacismEventList;
