// /api/memes.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
  try{
    const data = await fetch('https://www.reddit.com/r/BitcoinMemes/top/.json?limit=20&t=day', { headers: { 'User-Agent':'btc-is-freedom/1.0' }}).then(r=>r.json());
    const items = (data.data.children||[]).map(p => {
      const post = p.data;
      let image = null;
      if (post.preview && post.preview.images && post.preview.images[0]) {
        image = post.preview.images[0].source.url.replace(/&amp;/g,'&');
      }
      return { title: post.title, url: 'https://reddit.com'+post.permalink, image };
    });
    res.setHeader('Cache-Control','s-maxage=600, stale-while-revalidate=600');
    res.status(200).json({ items });
  }catch(e){
    res.status(200).json({ items: [] });
  }
}
