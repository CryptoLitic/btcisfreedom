exports.handler = async () => {
  try{
    const subs = ['BitcoinMemes', 'Bitcoin', 'CryptoCurrencyMemes'];
    const items = [];
    for (const sub of subs) {
      try {
        const r = await fetch(`https://www.reddit.com/r/${sub}/top/.json?limit=12&t=day`, { headers: { 'User-Agent':'btc-is-freedom/2.0' }});
        const j = await r.json();
        (j.data.children||[]).forEach(p => {
          const post = p.data;
          if (post.over_18) return;
          let image = null;
          if (post.preview?.images?.[0]?.source?.url) {
            image = post.preview.images[0].source.url.replace(/&amp;/g,'&');
          }
          items.push({ title: post.title, url: 'https://reddit.com'+post.permalink, image });
        });
      } catch(e){}
    }
    if (!items.length) {
      return { statusCode:200, body: JSON.stringify({ items: [
        { title: 'HODL vibes', url: 'https://reddit.com/r/BitcoinMemes/', image: null },
        { title: '1 BTC = 1 BTC', url: 'https://reddit.com/r/Bitcoin/', image: null }
      ]})};
    }
    return { statusCode:200, headers:{'Cache-Control':'public, max-age=600'}, body: JSON.stringify({ items }) };
  }catch{
    return { statusCode:200, body: JSON.stringify({ items: [] }) };
  }
};
