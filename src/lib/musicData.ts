export interface Song {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year: string;
  songs: Song[];
}

export const albums: Album[] = [
  {
    id: '1',
    title: 'Imagine',
    artist: 'John Lennon',
    coverUrl: 'https://picsum.photos/seed/imagine/400/400',
    year: '1971',
    songs: [
      {
        id: '1-1',
        title: 'Imagine',
        duration: '3:01',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        id: '1-2',
        title: 'Crippled Inside',
        duration: '3:47',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      {
        id: '1-3',
        title: 'Jealous Guy',
        duration: '4:14',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      }
    ]
  },
  {
    id: '2',
    title: 'A Night at the Opera',
    artist: 'Queen',
    coverUrl: 'https://picsum.photos/seed/queen/400/400',
    year: '1975',
    songs: [
      {
        id: '2-1',
        title: 'Bohemian Rhapsody',
        duration: '5:55',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      },
      {
        id: '2-2',
        title: 'Love of My Life',
        duration: '3:33',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        id: '2-3',
        title: 'You\'re My Best Friend',
        duration: '2:52',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      }
    ]
  },
  {
    id: '3',
    title: 'Hotel California',
    artist: 'Eagles',
    coverUrl: 'https://picsum.photos/seed/eagles/400/400',
    year: '1976',
    songs: [
      {
        id: '3-1',
        title: 'Hotel California',
        duration: '6:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
      },
      {
        id: '3-2',
        title: 'Life in the Fast Lane',
        duration: '4:45',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      }
    ]
  },
  {
    id: '4',
    title: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    coverUrl: 'https://picsum.photos/seed/ledzep/400/400',
    year: '1971',
    songs: [
      {
        id: '4-1',
        title: 'Stairway to Heaven',
        duration: '8:02',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        id: '4-2',
        title: 'Black Dog',
        duration: '4:54',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      }
    ]
  },
  {
    id: '5',
    title: 'Nevermind',
    artist: 'Nirvana',
    coverUrl: 'https://picsum.photos/seed/nirvana/400/400',
    year: '1991',
    songs: [
      {
        id: '5-1',
        title: 'Smells Like Teen Spirit',
        duration: '5:01',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      },
      {
        id: '5-2',
        title: 'Come As You Are',
        duration: '3:39',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      }
    ]
  },
  {
    id: '6',
    title: 'Thriller',
    artist: 'Michael Jackson',
    coverUrl: 'https://picsum.photos/seed/mj/400/400',
    year: '1982',
    songs: [
      {
        id: '6-1',
        title: 'Billie Jean',
        duration: '4:54',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        id: '6-2',
        title: 'Beat It',
        duration: '4:18',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      }
    ]
  },
  {
    id: '7',
    title: 'Appetite for Destruction',
    artist: 'Guns N Roses',
    coverUrl: 'https://picsum.photos/seed/gnr/400/400',
    year: '1987',
    songs: [
      {
        id: '7-1',
        title: 'Sweet Child O Mine',
        duration: '5:56',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
      },
      {
        id: '7-2',
        title: 'Welcome to the Jungle',
        duration: '4:31',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      }
    ]
  },
  {
    id: '8',
    title: 'Highway 61 Revisited',
    artist: 'Bob Dylan',
    coverUrl: 'https://picsum.photos/seed/dylan/400/400',
    year: '1965',
    songs: [
      {
        id: '8-1',
        title: 'Like a Rolling Stone',
        duration: '6:13',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      }
    ]
  }
];

// 获取所有歌曲的扁平化列表（用于播放器）
export function getAllSongs(): (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string })[] {
  const allSongs: (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string })[] = [];
  albums.forEach(album => {
    album.songs.forEach(song => {
      allSongs.push({
        ...song,
        albumId: album.id,
        albumTitle: album.title,
        artist: album.artist,
        coverUrl: album.coverUrl
      });
    });
  });
  return allSongs;
}

// 根据歌曲ID获取完整歌曲信息（包含专辑信息）
export function getSongById(songId: string): (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string }) | null {
  for (const album of albums) {
    const song = album.songs.find(s => s.id === songId);
    if (song) {
      return {
        ...song,
        albumId: album.id,
        albumTitle: album.title,
        artist: album.artist,
        coverUrl: album.coverUrl
      };
    }
  }
  return null;
}
