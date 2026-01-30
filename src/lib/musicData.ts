export interface Music {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
}

export const musicList: Music[] = [
  {
    id: '1',
    title: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
    duration: '3:01',
    coverUrl: 'https://picsum.photos/seed/imagine/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: '5:55',
    coverUrl: 'https://picsum.photos/seed/bohemian/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: '6:30',
    coverUrl: 'https://picsum.photos/seed/hotel/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '4',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: '8:02',
    coverUrl: 'https://picsum.photos/seed/stairway/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: '5',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    duration: '5:01',
    coverUrl: 'https://picsum.photos/seed/nirvana/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: '6',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'Thriller',
    duration: '4:54',
    coverUrl: 'https://picsum.photos/seed/billie/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    id: '7',
    title: 'Sweet Child O Mine',
    artist: 'Guns N Roses',
    album: 'Appetite for Destruction',
    duration: '5:56',
    coverUrl: 'https://picsum.photos/seed/sweet/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: '8',
    title: 'Like a Rolling Stone',
    artist: 'Bob Dylan',
    album: 'Highway 61 Revisited',
    duration: '6:13',
    coverUrl: 'https://picsum.photos/seed/dylan/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];
