// IP Geolocation utility - uses public IP geolocation service
// For production, consider using a paid service like MaxMind or IP2Location

async function getLocationFromIp(ipAddress) {
  try {
    // Use ipapi.co (free tier available)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    
    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'XX',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      country_code: 'XX',
    };
  }
}

module.exports = { getLocationFromIp };
