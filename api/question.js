// /api/question.js
const axios = require('axios');
const cors = require('cors');

// 環境変数からAPIキーを取得
const PIXABAY_KEY = process.env.PIXABAY_KEY;

// キーワード定義
const 画像キーワード = ['ネコ', 'イヌ', 'ウマ', 'トリ', 'ウサギ', 'クルマ', 'デンシャ', 'ビル'];
const 動画キーワード = ['ドローン', 'テクノロジー', 'ヒト', 'シティ', 'スポーツ', 'ネイチャー'];

// ユーティリティ関数
const ランダム = arr => arr[Math.floor(Math.random() * arr.length)];
const シャッフル = arr => [...arr].sort(() => Math.random() - 0.5);

// Vercelのサーバーレス関数
module.exports = async (req, res) => {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストに対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      
      return res.status(200).json({
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
      
      return res.status(200).json({
        type: 'video',
        imageUrl: 正解動画.videos.medium.url,
        options: 選択肢,
        correctAnswer: キーワード
      });
    }
  } catch (err) {
    console.error('問題取得エラー:', err.message);
    return res.status(500).json({ error: '問題取得失敗', message: err.message });
  }
};