// api/video.js - Jembatan Telegram -> Web JajanNonton
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { id } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN;

  // NANTI ISI FILE_ID DI SINI SETELAH DAPET DARI BOT GetFileId
  // Cara dapetnya: Forward video dari channel ke @GetFileIdBot, dia kasih file_id
  const MAP = {
    "1": "FILE_ID_VIDEO_TES_1", // ganti dengan file_id asli
  };

  const file_id = MAP[id];
  if (!file_id) {
    return res.status(404).json({ error: 'Video belum ada di MAP, id=' + id });
  }

  // 1. Minta info file ke Telegram
  const info = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`).then(r => r.json());
  if (!info.ok) return res.status(500).json(info);

  const filePath = info.result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

  // 2. Streaming ke browser (biar bisa di-seek / skip)
  const range = req.headers.range;
  const headers = {};
  if (range) headers['Range'] = range;

  const tg = await fetch(fileUrl, { headers });
  res.status(tg.status);
  tg.headers.forEach((v, k) => {
    if (['content-type','content-length','content-range','accept-ranges'].includes(k.toLowerCase())) {
      res.setHeader(k, v);
    }
  });
  const buf = Buffer.from(await tg.arrayBuffer());
  res.send(buf);
}
