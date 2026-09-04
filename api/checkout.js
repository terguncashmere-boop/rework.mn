/**
 * POST /api/checkout
 *
 * Byl дээр checkout үүсгээд төлбөрийн хуудасны хаягийг буцаана.
 *
 * API token зөвхөн энд, серверийн орчны хувьсагчид байна. Клиент тал ямар
 * бүтээгдэхүүн авахыг `item` түлхүүрээр л хэлнэ — үнэ, тоо хэмжээг доорх
 * CATALOG шийднэ, тул хөтчөөс дүн, price_id өөрчлөх боломжгүй.
 */

const BYL_API = 'https://byl.mn/api/v1';

// Сайтад зарагдах бүтээгдэхүүнүүд.
// Шинэ бүтээгдэхүүн нэмэхдээ энд мөр нэмээд, HTML дээр data-checkout="<түлхүүр>" гэж заана.
const CATALOG = {
  rework: { priceId: 1630, quantity: 1 },
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = process.env.BYL_TOKEN;
  const projectId = process.env.BYL_PROJECT_ID;

  if (!token || !projectId) {
    console.error('BYL_TOKEN эсвэл BYL_PROJECT_ID тохируулаагүй байна.');
    return res.status(500).json({ error: 'not_configured' });
  }

  const key = (req.body && req.body.item) || 'rework';
  const item = Object.prototype.hasOwnProperty.call(CATALOG, key) ? CATALOG[key] : null;

  if (!item) {
    return res.status(400).json({ error: 'unknown_item' });
  }

  // Домэйныг хүсэлтээс уншина — ингэснээр preview, production, локал бүгдэд зөв ажиллана.
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  let response;
  let payload;

  try {
    response = await fetch(`${BYL_API}/projects/${projectId}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: item.priceId, quantity: item.quantity }],
        success_url: `${origin}/?checkout=success`,
        cancel_url: `${origin}/?checkout=cancelled`,
        // Ном бол биет бараа — хүргэлтэд хаяг, утас хэрэгтэй.
        email_collection: true,
        phone_number_collection: true,
        delivery_address_collection: true,
      }),
    });

    payload = await response.json();
  } catch (err) {
    console.error('Byl API руу холбогдож чадсангүй:', err);
    return res.status(502).json({ error: 'upstream_unreachable' });
  }

  if (!response.ok || !payload || !payload.data || !payload.data.url) {
    // Byl-ийн дэлгэрэнгүй алдааг зөвхөн лог руу — клиентэд дотоод мэдээлэл өгөхгүй.
    console.error('Byl checkout үүсгэж чадсангүй:', response.status, JSON.stringify(payload));
    return res.status(502).json({ error: 'checkout_failed' });
  }

  return res.status(200).json({ url: payload.data.url });
};
