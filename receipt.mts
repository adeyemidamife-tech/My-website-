import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { database } from '../../db/index.js';
import { orders } from '../../db/schema.js';
export default async (req: Request) => {
  if(req.method!=='GET') return new Response('Method not allowed',{status:405});
  const id=new URL(req.url).searchParams.get('code')||'';
  if(!/^DRM-[a-f0-9-]{36}$/.test(id)) return new Response('Not found',{status:404});
  try {
    const [o]=await database().select().from(orders).where(eq(orders.id,id)).limit(1);
    if(!o) return new Response('Not found',{status:404});
    const escape=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
    // Personal contact and delivery details stay off the shareable receipt.
    const lines=['DOUGH RE MI · BREAD & BAKES','Iyana Ipaja, Aboru · Daily 8am–4pm','ORDER RECEIPT',o.id,new Date(o.createdAt).toLocaleString('en-GB',{timeZone:'Africa/Lagos'})+' WAT','',...o.items.map(i=>`${i.quantity} × ${i.name} — NGN ${(i.price*i.quantity).toLocaleString('en-NG')}`),'',`Total incl. packaging: NGN ${o.total.toLocaleString('en-NG')}`,`Fulfilment: ${o.method}`,'Delivery fee confirmed separately.','','Payment reported by customer.','Transfer pending business verification.','This receipt is not proof of payment.','','WhatsApp: 07088518815','Check the original receipt link against this code.'];
    const height=130+lines.length*36;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}"><rect width="100%" height="100%" fill="#fff5e5"/><rect width="14" height="100%" fill="#b64d26"/>${lines.map((l,i)=>`<text x="45" y="${65+i*36}" font-family="sans-serif" font-size="${i===0?29:22}" fill="#432416">${escape(l)}</text>`).join('')}</svg>`;
    const png=await sharp(Buffer.from(svg)).png().toBuffer();
    return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png','Content-Disposition':`inline; filename="${id}.png"`,'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}});
  } catch {return new Response('Receipt temporarily unavailable. Please retry.',{status:503});}
};
