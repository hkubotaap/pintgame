const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PIXABAY_KEY = process.env.PIXABAY_KEY;

app.use(cors());
app.use(express.static('public'));

const 画像キーワード = ['ネコ', 'イヌ', 'ウマ', 'トリ', 'ウサギ', 'クルマ', 'デンシャ', 'ビル'];
const 動画キーワード = ['ドローン', 'テクノロジー', 'ヒト', 'シティ', 'スポーツ', 'ネイチャー'];

const ランダム = arr => arr[Math.floor(Math.random() * arr.length)];
const シャッフル = arr => [...arr].sort(() => Math.random() - 0.5);

app.get('/api/question', async (req, res) => {
  const 種類 = ランダム(['image', 'video']);

  try {
    if (種類 === 'image') {
      const キーワード = ランダム(画像キーワード);
      const r = await axios.get(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(キーワード)}&image_type=photo&lang=ja&per_page=10`);
      const hits = r.data.hits;
      if (!hits || !hits.length) throw new Error('画像取得失敗');

      const 正解画像 = ランダム(hits);
      const 誤答 = シャッフル(画像キーワード.filter(k => k !== キーワード)).slice(0, 3);
      const 選択肢 = シャッフル([キーワード, ...誤答]);

      res.json({
        type: 'image',
        imageUrl: 正解画像.webformatURL,
        options: 選択肢,
        correctAnswer: キーワード
      });

    } else {
      const キーワード = ランダム(動画キーワード);
      const r = await axios.get(`https://pixabay.com/api/videos/?key=${PIXABAY_KEY}&q=${encodeURIComponent(キーワード)}&lang=ja&per_page=10`);
      const hits = r.data.hits;
      if (!hits || !hits.length) throw new Error('動画取得失敗');

      const 正解動画 = ランダム(hits);
      const 誤答 = シャッフル(動画キーワード.filter(k => k !== キーワード)).slice(0, 3);
      const 選択肢 = シャッフル([キーワード, ...誤答]);

      res.json({
        type: 'video',
        imageUrl: 正解動画.videos.medium.url,
        options: 選択肢,
        correctAnswer: キーワード
      });
    }

  } catch (err) {
    console.error('問題取得エラー:', err.message);
    res.status(500).json({ error: '問題取得失敗' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ サーバー起動中: http://localhost:${PORT}`);
});
