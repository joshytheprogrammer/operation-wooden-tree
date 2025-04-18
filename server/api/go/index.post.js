import useFirebaseServer from '~/composables/useFirebaseServer';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { UAParser } from 'ua-parser-js';

export default defineEventHandler(async (event) => {
  try {
    const { db } = useFirebaseServer();
    const body = await readBody(event);
    const { treeId, linkId } = body;
    
    // Validate required parameters
    if (!treeId || !linkId) {
      return {
        error: 'Missing required parameters',
        status: 400
      };
    }

    // Get client info
    const headers = getHeaders(event);
    const userAgent = headers['user-agent'] || '';
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '0.0.0.0';
    const timestamp = Timestamp.now();
    
    // Parse user agent
    const parser = new UAParser(userAgent);
    const parsedUA = parser.getResult();
    const deviceType = parsedUA.device.type || 'desktop';
    const browser = parsedUA.browser.name;
    const os = parsedUA.os.name;

    // Create batch for atomic operations
    const batch = db.batch();
    
    // Get link data
    const linkRef = db.collection('trees').doc(treeId).collection('links').doc(linkId);
    const linkSnapshot = await linkRef.get();
    
    if (!linkSnapshot.exists) {
      return { error: 'Link not found', status: 404 };
    }
    
    const linkData = linkSnapshot.data();
    
    // Make sure we have a destination URL
    if (!linkData.value) {
      return { error: 'Invalid link destination', status: 400 };
    }
    
    // Get location data from IP API (free tier, no API key needed)
    let geoData = {};
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
      if (geoResponse.ok) {
        geoData = await geoResponse.json();
      }
    } catch (error) {
      console.error('Error fetching geo data:', error);
    }
    
    // Create click record
    const clickData = {
      treeId,
      linkId,
      timestamp,
      ipAddress,
      userAgent,
      device: {
        type: deviceType,
        browser,
        os
      },
      location: {
        country: geoData.country || 'Unknown',
        countryCode: geoData.countryCode || 'XX',
        region: geoData.regionName || 'Unknown',
        city: geoData.city || 'Unknown'
      },
      linkTitle: linkData.title || '',
      linkType: linkData.type || 'url'
    };
    
    // Add click record
    const clickRef = db.collection('clicks').doc();
    batch.set(clickRef, clickData);
    
    // Increment link click count
    batch.update(linkRef, {
      clickCount: (linkData.clickCount || 0) + 1
    });
    
    // Increment tree total clicks
    const treeRef = db.collection('trees').doc(treeId);
    batch.update(treeRef, {
      totalClicks: FieldValue.increment(1)
    });
    
    // Commit all updates
    await batch.commit();
    
    // Return destination URL for the client to handle the redirect
    return {
      url: linkData.value,
      status: 200
    };
    
  } catch (error) {
    console.error('Error processing link click:', error);
    return {
      error: 'Failed to process link',
      status: 500
    };
  }
});