/**
 * Version: 1.0.0
 * Trade Desk Performance Insights Report Worker
 * 
 * This worker authenticates with The Trade Desk API and fetches
 * Performance Insights reports.
 * 
 * Required Environment Variables:
 * - TRADEDESK_API_KEY: Your Trade Desk API key
 * - TRADEDESK_USERNAME: Your Trade Desk username
 * - TRADEDESK_PASSWORD: Your Trade Desk password
 * - TRADEDESK_ADVERTISER_ID: Your advertiser ID for the report
 */

export default {
  async fetch(request, env, ctx) {
    try {
      console.info({ message: 'Trade Desk Report Worker started' });
      
      // Authenticate with Trade Desk API
      const authResponse = await authenticateWithTradeDesk(env);
      
      if (!authResponse.success) {
        return new Response(JSON.stringify({
          error: 'Authentication failed',
          details: authResponse.error
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Fetch Performance Insights report
      const reportData = await fetchPerformanceInsightsReport(authResponse.token, env);
      
      if (!reportData.success) {
        return new Response(JSON.stringify({
          error: 'Failed to fetch report',
          details: reportData.error
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return sample of the data
      return new Response(JSON.stringify({
        message: 'Trade Desk Performance Insights Report',
        sampleData: reportData.data,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Authenticate with The Trade Desk API
 */
async function authenticateWithTradeDesk(env) {
  try {
    const authUrl = 'https://api.thetradedesk.com/v3/authentication';
    
    // The Trade Desk API expects different field names
    const authPayload = {
      Login: env.TRADEDESK_USERNAME,
      Password: env.TRADEDESK_PASSWORD
    };
    
    console.log('Attempting authentication with URL:', authUrl);
    console.log('Using username:', env.TRADEDESK_USERNAME);
    console.log('API Key present:', !!env.TRADEDESK_API_KEY);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTD-Auth': env.TRADEDESK_API_KEY
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log('Auth response status:', response.status);
    console.log('Auth response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Auth error response:', errorText);
      throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const authData = await response.json();
    console.log('Auth success, received token:', !!authData.Token);
    
    return {
      success: true,
      token: authData.Token
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch Performance Insights report from Trade Desk
 */
async function fetchPerformanceInsightsReport(token, env) {
  try {
    const reportUrl = 'https://api.thetradedesk.com/v3/insights/performance';
    
    // Define report parameters - you can modify these based on your needs
    const reportParams = {
      AdvertiserId: env.TRADEDESK_ADVERTISER_ID,
      StartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
      EndDate: new Date().toISOString().split('T')[0], // Today
      Dimensions: ['CampaignId', 'CampaignName'],
      Metrics: ['Impressions', 'Clicks', 'Spend', 'Conversions'],
      TimeGranularity: 'Day'
    };
    
    const response = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTD-Auth': token
      },
      body: JSON.stringify(reportParams)
    });
    
    if (!response.ok) {
      throw new Error(`Report fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const reportData = await response.json();
    
    // Extract sample data (first 5 rows if available)
    const sampleData = reportData.Data && reportData.Data.length > 0 
      ? reportData.Data.slice(0, 5) 
      : reportData;
    
    return {
      success: true,
      data: {
        reportSummary: {
          totalRows: reportData.Data ? reportData.Data.length : 0,
          dateRange: `${reportParams.StartDate} to ${reportParams.EndDate}`,
          dimensions: reportParams.Dimensions,
          metrics: reportParams.Metrics
        },
        sampleRows: sampleData,
        fullResponse: reportData // Include full response for debugging
      }
    };
    
  } catch (error) {
    console.error('Report fetch error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}