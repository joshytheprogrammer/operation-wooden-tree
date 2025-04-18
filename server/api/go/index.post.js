// ~/server/api/go.post.ts
import useFirebaseServer from '~/composables/useFirebaseServer';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { UAParser } from 'ua-parser-js';

export default defineEventHandler(async (event) => {
  try {
    const { db } = useFirebaseServer();
    const body = await readBody(event);
    const { treeId, linkId, fingerprintData } = body;
    
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

    const isLocalIp = ['127.0.0.1', '::1', 'localhost', '0.0.0.0'].includes(ipAddress);
    
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
    
    let geoData = {
      country: 'Unknown',
      countryCode: 'XX',
      region: '',
      regionName: '',
      city: '',
      zip: '',
      timezone: '',
      isp: '',
      org: '',
      as: ''
    };
    
    try {
      // Only make the API call if not a local IP, otherwise use mock data
      if (!isLocalIp) {
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=61439`);
        const data = await response.json();
        
        if (data.status === 'success') {
          geoData = { 
            ...geoData, 
            country: data.country || geoData.country,
            countryCode: data.countryCode || geoData.countryCode,
            // ... other fields as before
          };
        } else {
          console.error('IP API failed:', data.message || 'Unknown error');
        }
      } else {
        // Use mock data for local development
        geoData = {
          country: 'Development',
          countryCode: 'DEV',
          region: 'Local',
          regionName: 'Development Region',
          city: 'localhost',
          zip: '00000',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lat: 0,
          lon: 0,
          isp: 'Development ISP',
          org: 'Development Organization',
          as: 'AS0 Development'
        };
        console.log('Using mock geolocation data for development');
      }
    } catch (error) {
      console.error('Error fetching geo data:', error);
    }
    
    // Generate or use provided fingerprint
    let fingerprintId = 'unknown';
    let isUnique = false;


    // Check if fingerprint exists
    const fingerprintQuery = await db.collection('fingerprints')
      .where('visitorId', '==', fingerprintId)
      .limit(1)
      .get();

    if (!fingerprintQuery.empty) {
      isUnique = false;
    }

    if (fingerprintData && !fingerprintData.error) {
      fingerprintId = fingerprintData.visitorId;
      isUnique = true;

      // Check if fingerprint exists
      const fingerprintQuery = await db.collection('fingerprints')
        .where('visitorId', '==', fingerprintId)
        .limit(1)
        .get();

      if (!fingerprintQuery.empty) {
        isUnique = false;
        // Update last seen for existing fingerprint
        const existingFingerprint = fingerprintQuery.docs[0];
        batch.update(existingFingerprint.ref, {
          lastSeen: timestamp,
          $inc: { visitCount: 1 }
        });
      } else {
        // Create new fingerprint record
        const fingerprintRef = db.collection('fingerprints').doc();
        batch.set(fingerprintRef, {
          ...fingerprintData,
          firstSeen: timestamp,
          lastSeen: timestamp,
          ipAddress,
          userAgent
        });
      }
    }

    // Create comprehensive click record
    const clickData = {
      treeId,
      linkId,
      timestamp,
      isUnique: fingerprintData && !fingerprintData.error ? isUnique : false,
      fingerprintId: fingerprintData && !fingerprintData.error ? fingerprintId : 'failed',
      ipAddress,
      userAgent,
      device: {
        type: deviceType,
        browser,
        os,
        vendor: parsedUA.device.vendor || 'Unknown',
        model: parsedUA.device.model || 'Unknown',
        cpu: parsedUA.cpu.architecture || 'Unknown'
      },
      screen: fingerprintData?.screen || {},
      location: {
        country: geoData.country || 'Unknown',
        countryCode: geoData.countryCode || 'XX',
        region: geoData.regionName || 'Unknown',
        city: geoData.city || 'Unknown',
        zip: geoData.zip || 'Unknown',
        coordinates: geoData.lat && geoData.lon ? {
          latitude: geoData.lat,
          longitude: geoData.lon
        } : null,
        timezone: geoData.timezone || 'Unknown',
        isp: geoData.isp || 'Unknown',
        org: geoData.org || 'Unknown',
        as: geoData.as || 'Unknown'
      },
      network: {
        connection: headers['connection'] || '',
        acceptLanguage: headers['accept-language'] || '',
        doNotTrack: headers['dnt'] || '0',
      },
      linkTitle: linkData.title || '',
      linkType: linkData.type || 'url',
      referrer: headers['referer'] || 'direct'
    };
    
    // Add click record
    const clickRef = db.collection('clicks').doc();
    batch.set(clickRef, clickData);
    
    // Increment link click count
    batch.update(linkRef, {
      clickCount: FieldValue.increment(1),
      // Only increment unique count if fingerprint succeeded
      uniqueClickCount: fingerprintData && !fingerprintData.error ? 
        FieldValue.increment(isUnique ? 1 : 0) : 
        FieldValue.increment(0)
    });

    // Increment tree total clicks
    const treeRef = db.collection('trees').doc(treeId);

    // Same for tree counts
    batch.update(treeRef, {
      totalClicks: FieldValue.increment(1),
      uniqueVisitors: fingerprintData && !fingerprintData.error ? 
        FieldValue.increment(isUnique ? 1 : 0) : 
        FieldValue.increment(0)
    });
    
    // Commit all updates
    await batch.commit();
    
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