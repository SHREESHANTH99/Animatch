import { useEffect, useState } from 'react';

export function useAnimeData() {
  const [animeList, setAnimeList] = useState([]);

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/top/anime?limit=30')
      .then(res => res.json())
      .then(data => {
        setAnimeList(data.data || []);
      })
      .catch(err => console.error(err));
  }, []);

  return animeList;
}