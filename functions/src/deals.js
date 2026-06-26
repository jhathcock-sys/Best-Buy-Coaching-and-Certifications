const functions = require('firebase-functions');
const xml2js = require('xml2js');

exports.scrapeDeals = functions.https.onCall(async (data, context) => {
  // We can enforce authentication if needed. Let's enforce it to be safe, like the others.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }

  try {
    const url = 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&sq=best+buy&rss=1';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();
    
    // Parse the XML
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    // Extract items
    const channel = result.rss?.channel;
    if (!channel) {
      return [];
    }
    
    // xml2js returns a single item as an object, multiple items as an array
    const rawItems = channel.item;
    let itemsArray = [];
    
    if (Array.isArray(rawItems)) {
      itemsArray = rawItems;
    } else if (rawItems) {
      itemsArray = [rawItems];
    }

    const deals = itemsArray.map(item => ({
      title: item.title || '',
      link: item.link || '',
      description: item.description || ''
    }));

    return deals;
  } catch (error) {
    console.error('Error scraping deals:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
