export interface LyricLine {
  time: number; // 时间（秒）
  text: string; // 歌词文本
}

/**
 * 解析 LRC 格式的歌词文件
 * @param lrcText LRC 文本内容
 * @returns 解析后的歌词数组
 */
export function parseLRC(lrcText: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const lrcLines = lrcText.split('\n');

  lrcLines.forEach(line => {
    // 匹配时间戳格式 [mm:ss.xx]
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      const milliseconds = parseInt(timeMatch[3].padEnd(3, '0'), 10);
      const text = timeMatch[4].trim();

      // 计算总时间（秒）
      const time = minutes * 60 + seconds + milliseconds / 1000;

      if (text) { // 只添加有文本的行
        lines.push({ time, text });
      }
    }
  });

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * 根据当前播放时间获取应该高亮的歌词行索引
 * @param lyrics 歌词数组
 * @param currentTime 当前播放时间（秒）
 * @returns 应该高亮的行索引
 */
export function getCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  return -1;
}

/**
 * 将歌词数组转换为 LRC 格式字符串
 * @param lyrics 歌词数组
 * @returns LRC 格式字符串
 */
export function lyricsToLRC(lyrics: LyricLine[]): string {
  return lyrics.map(line => {
    const minutes = Math.floor(line.time / 60);
    const seconds = Math.floor(line.time % 60);
    const milliseconds = Math.floor((line.time % 1) * 100);

    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    return `[${timeStr}]${line.text}`;
  }).join('\n');
}
