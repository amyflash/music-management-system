export interface Song {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
  lyrics?: string;
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
        lyrics: `Imagine there's no heaven
It's easy if you try
No hell below us
Above us, only sky

Imagine all the people
Living for today

Imagine there's no countries
It isn't hard to do
Nothing to kill or die for
And no religion too

Imagine all the people
Living life in peace

You may say I'm a dreamer
But I'm not the only one
I hope someday you'll join us
And the world will be as one`
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
        lyrics: `Is this the real life?
Is this just fantasy?
Caught in a landslide
No escape from reality

Open your eyes
Look up to the skies and see
I'm just a poor boy
I need no sympathy

Because I'm easy come, easy go
Little high, little low
Any way the wind blows
Doesn't really matter to me

Mama, just killed a man
Put a gun against his head
Pulled my trigger, now he's dead

Mama, life had just begun
But now I've gone and thrown it all away

Mama, ooh
Didn't mean to make you cry
If I'm not back again this time tomorrow
Carry on, carry on
As if nothing really matters`
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
        lyrics: `On a dark desert highway
Cool wind in my hair
Warm smell of colitas
Rising up through the air

Up ahead in the distance
I saw a shimmering light
My head grew heavy and my sight grew dim
I had to stop for the night

There she stood in the doorway
I heard the mission bell
And I was thinking to myself
This could be heaven or this could be hell

Then she lit up a candle
And she showed me the way
There were voices down the corridor
I thought I heard them say

Welcome to the Hotel California
Such a lovely place, such a lovely face
Plenty of room at the Hotel California
Any time of year, you can find it here`
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
        lyrics: `There's a lady who's sure
All that glitters is gold
And she's buying a stairway to heaven

When she gets there she knows
If the stores are all closed
With a word she can get what she came for

Ooh, ooh, and she's buying a stairway to heaven

There's a sign on the wall
But she wants to be sure
'Cause you know sometimes words have two meanings

In a tree by the brook
There's a songbird who sings
Sometimes all of our thoughts are misgiven

Ooh, it makes me wonder
Ooh, it makes me wonder

There's a feeling I get
When I look to the west
And my spirit is crying for leaving`
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
