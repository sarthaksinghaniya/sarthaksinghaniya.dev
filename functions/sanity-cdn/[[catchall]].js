export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Zamieniamy naszą ścieżkę lokalną /sanity-cdn na oficjalną domenę Sanity CDN
  const sanityUrl = context.request.url.replace(url.origin + '/sanity-cdn', 'https://cdn.sanity.io');
  
  // Pobieramy obrazek z Sanity i mówimy Cloudflare, żeby skeszował go na 1 rok (obrazy w Sanity są niezmienne)
  return fetch(sanityUrl, {
    headers: context.request.headers,
    cf: {
      cacheEverything: true,
      cacheTtl: 31536000 // 1 rok w sekundach
    }
  });
}
