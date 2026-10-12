import fs from 'node:fs/promises';
import path from 'node:path';

const files = {
  seongsan: 'File:Seongsan Ilchulbong.jpg',
  peace: 'File:Jeju 4.3 Peace Park, Jeju Island, South Korea, June2016.jpg',
  osulloc: 'File:Osulloc Tea Museum & Fields, Jeju.jpg',
  olle: 'File:Jejuolle-route-06(5).jpg',
  beach: 'File:Jungmun Saekdal Beach, South Korea.jpg',
  cliff: 'File:Daepo Jusangjeolli Cliff 04.jpg',
  soesokkak: 'File:Soesokkak, Jeju (제주 쇠소깍) - panoramio.jpg',
  market: 'File:Dongmun Market 01.JPG',
};
const api = new URL('https://commons.wikimedia.org/w/api.php');
api.search = new URLSearchParams({
  action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url',
  iiurlwidth: '1400', titles: Object.values(files).join('|'),
});
const headers = { 'User-Agent': 'CodexJejuGuide/1.0 (educational site)' };
const data = await fetch(api, { headers }).then(r => r.json());
const pages = Object.values(data.query.pages);
for (const [name, title] of Object.entries(files)) {
  const page = pages.find(p => p.title === title);
  if (!page?.imageinfo?.[0]?.thumburl) throw new Error(`Missing image: ${title}`);
  const response = await fetch(page.imageinfo[0].thumburl, { headers });
  if (!response.ok) throw new Error(`Download failed: ${title} ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.writeFile(path.join('dist', 'assets', `${name}.jpg`), bytes);
  console.log(name, bytes.length);
}
