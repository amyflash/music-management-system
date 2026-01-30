export interface Song {
  id: string;
  albumId?: string;  // 所属专辑 ID（可选，用于从数据库加载的歌曲）
  title: string;
  duration: string;
  audioUrl: string;
  lyrics?: string;  // 歌词文本（用于静态数据）
  lyricsUrl?: string;  // 歌词文件 URL（用于用户上传的数据）
  coverUrl?: string;  // 专辑封面 URL（可选）
  artist?: string;  // 歌手（可选）
  albumTitle?: string;  // 专辑名称（可选）
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        lyrics: `[00:00.00]Imagine there's no heaven
[00:04.50]It's easy if you try
[00:09.00]No hell below us
[00:13.50]Above us, only sky
[00:18.00]Imagine all the people
[00:23.00]Living for today
[00:28.50]Imagine there's no countries
[00:33.00]It isn't hard to do
[00:38.00]Nothing to kill or die for
[00:42.50]And no religion too
[00:47.00]Imagine all the people
[00:52.00]Living life in peace
[00:56.50]You may say I'm a dreamer
[01:02.00]But I'm not the only one
[01:07.00]I hope someday you'll join us
[01:12.00]And the world will be as one`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        lyrics: `[00:00.00]Is this the real life?
[00:04.00]Is this just fantasy?
[00:08.00]Caught in a landslide
[00:12.00]No escape from reality
[00:16.00]Open your eyes
[00:20.00]Look up to the skies and see
[00:24.00]I'm just a poor boy
[00:28.00]I need no sympathy
[00:32.00]Because I'm easy come, easy go
[00:36.00]Little high, little low
[00:40.00]Any way the wind blows
[00:44.00]Doesn't really matter to me
[00:48.00]Mama, just killed a man
[00:52.00]Put a gun against his head
[00:56.00]Pulled my trigger, now he's dead
[01:00.00]Mama, life had just begun
[01:04.00]But now I've gone and thrown it all away`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        lyrics: `[00:00.00]On a dark desert highway
[00:05.00]Cool wind in my hair
[00:10.00]Warm smell of colitas
[00:15.00]Rising up through the air
[00:20.00]Up ahead in the distance
[00:25.00]I saw a shimmering light
[00:30.00]My head grew heavy and my sight grew dim
[00:35.00]I had to stop for the night
[00:40.00]There she stood in the doorway
[00:45.00]I heard the mission bell
[00:50.00]And I was thinking to myself
[00:55.00]This could be heaven or this could be hell
[01:00.00]Then she lit up a candle
[01:05.00]And she showed me the way
[01:10.00]There were voices down the corridor
[01:15.00]I thought I heard them say
[01:20.00]Welcome to the Hotel California
[01:25.00]Such a lovely place, such a lovely face
[01:30.00]Plenty of room at the Hotel California
[01:35.00]Any time of year, you can find it here`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        lyrics: `[00:00.00]There's a lady who's sure
[00:05.00]All that glitters is gold
[00:10.00]And she's buying a stairway to heaven
[00:16.00]When she gets there she knows
[00:21.00]If the stores are all closed
[00:26.00]With a word she can get what she came for
[00:32.00]Ooh, ooh, and she's buying a stairway to heaven
[00:40.00]There's a sign on the wall
[00:45.00]But she wants to be sure
[00:50.00]'Cause you know sometimes words have two meanings
[00:56.00]In a tree by the brook
[01:01.00]There's a songbird who sings
[01:06.00]Sometimes all of our thoughts are misgiven
[01:12.00]Ooh, it makes me wonder
[01:18.00]Ooh, it makes me wonder
[01:24.00]There's a feeling I get
[01:29.00]When I look to the west
[01:34.00]And my spirit is crying for leaving`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        lyrics: `Load up on guns, bring your friends
It's fun to lose and to pretend
She's over-bored and self-assured
Oh no, I know a dirty word

Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello

With the lights out, it's less dangerous
Here we are now, entertain us
I feel stupid and contagious
Here we are now, entertain us

A mulatto, an albino
A mosquito, my libido
Yeah

I'm worse at what I do best
And for this gift I feel blessed
Our little group has always been
And always will until the end

Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        lyrics: `She was more like a beauty queen from a movie scene
I said don't mind, but what do you mean, I am the one
Who will dance on the floor in the round

She said I am the one, who will dance on the floor in the round

She told me her name was Billie Jean, as she caused a scene
Then every head turned with eyes that dreamed of being the one
Who will dance on the floor in the round

People always told me be careful of what you do
And don't go around breaking young girls' hearts
And mother always told me be careful of who you love
And be careful of what you do 'cause the lie becomes the truth

Billie Jean is not my lover
She's just a girl
Who claims that I am the one
But the kid is not my son

She says I am the one, but the kid is not my son`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        lyrics: `She's got a smile that it seems to me
Reminds me of childhood memories
Where everything was as fresh as the bright blue sky
Now and then when I see her face
She takes me away to that special place
And if I stared too long I'd probably break down and cry

Oh, oh, oh
Sweet child o' mine
Oh, oh, oh, oh
Sweet love of mine

She's got eyes of the bluest skies
As if they thought of rain
I'd hate to look into those eyes and see an ounce of pain
Her hair reminds me of a warm safe place
Where as a child I'd hide
And pray for the thunder and the rain to quietly pass me by

Oh, oh, oh
Sweet child o' mine
Oh, oh, oh, oh
Sweet love of mine

Where do we go?
Where do we go now?
Where do we go?
Sweet child o' mine`
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
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        lyrics: `Once upon a time you dressed so fine
Threw the bums a dime in your prime, didn't you?
People call, say "Beware doll, you're bound to fall"
You thought they were all kidding you

You used to laugh about
Everybody that was hanging out
Now you don't talk so loud
Now you don't seem so proud
About having to be scrounging your next meal

How does it feel?
How does it feel?
To be without a home
Like a complete unknown
Like a rolling stone?

You've gone to the finest schools, all right, Miss Lonely
But you know you only used to get juiced in it
Nobody's ever taught you how to live out on the street
And now you're gonna have to get used to it

You say you never compromise
With the mystery tramp, but now you realize
He's not selling any alibis
As you stare into the vacuum of his eyes
And say do you want to make a deal?`
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
