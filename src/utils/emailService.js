const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const ensureEmailJsConfig = () => {
  const missing = [];
  if (!serviceId) missing.push('VITE_EMAILJS_SERVICE_ID');
  if (!templateId) missing.push('VITE_EMAILJS_TEMPLATE_ID');
  if (!publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY');
  
  if (missing.length > 0) {
    throw new Error(`EmailJS is not configured. Missing: ${missing.join(', ')}. Please set these in your .env file.`);
  }
};

/**
 * Send email using EmailJS API directly
 * @param {object} params - Email parameters
 * @returns {Promise<Response>}
 */
const sendEmailJSRequest = async (templateParams) => {
  ensureEmailJsConfig();

  const requestData = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams
  };

  console.log('📧 EmailJS API Request:', {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey ? `${publicKey.substring(0, 15)}...` : '❌ MISSING',
    template_params: templateParams
  });

  const response = await fetch(EMAILJS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  const responseText = await response.text();
  
  console.log('📧 EmailJS API Response:', {
    status: response.status,
    statusText: response.statusText,
    text: responseText
  });

  if (!response.ok) {
    throw new Error(`EmailJS API error: ${response.status} ${response.statusText} - ${responseText}`);
  }

  // EmailJS returns "OK" as text on success (status 200)
  if (response.status === 200 && responseText === 'OK') {
    return { status: 200, text: 'OK' };
  } else {
    throw new Error(`Unexpected EmailJS response: ${responseText}`);
  }
};

/**
 * Test EmailJS configuration by sending a test email
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const testEmailJSConfig = async (testEmail = 'test@example.com') => {
  try {
    const testParams = {
      user_name: 'Test User',
      user_email: testEmail,
      otp_code: '123456',
      // Include all common recipient parameter formats
      to_email: testEmail,
      to_name: 'Test User',
      email: testEmail,
      reply_to: testEmail
    };

    console.log('🧪 Testing EmailJS configuration:', {
      serviceId: serviceId || '❌ MISSING',
      templateId: templateId || '❌ MISSING',
      publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : '❌ MISSING',
      testEmail
    });

    const response = await sendEmailJSRequest(testParams);
    
    if (response.status === 200 && response.text === 'OK') {
      return {
        success: true,
        message: 'EmailJS configuration is valid! Test email sent successfully.'
      };
    } else {
      return {
        success: false,
        message: `EmailJS test failed: Status ${response.status}, Text: ${response.text}`
      };
    }
  } catch (error) {
    console.error('EmailJS test error:', error);
    
    let errorMessage = 'EmailJS test failed: ';
    if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += 'Unknown error';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const sendVerificationEmail = async ({ name, email, otp }) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address format');
    }

    // Validate OTP format (should be 6 digits)
    if (!otp || !/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP format');
    }

    // Template parameters must match exactly what's in your EmailJS template
    // EmailJS services need the recipient email - try multiple common parameter names
    const templateParams = {
      user_name: name || 'User',
      user_email: email,
      otp_code: otp,
      // Try multiple recipient parameter formats that EmailJS services commonly use
      to_email: email,        // Most common for dynamic recipients
      to_name: name || 'User', // Recipient name
      email: email,           // Alternative format
      reply_to: email,       // Some services use reply_to
      // Note: If your EmailJS service is configured with a static recipient,
      // you may need to configure it in the EmailJS dashboard to accept dynamic recipients
    };

    console.log('📧 Sending verification email with EmailJS API:', {
      serviceId: serviceId || '❌ MISSING',
      templateId: templateId || '❌ MISSING',
      publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : '❌ MISSING',
      email,
      hasOtp: !!otp,
      otpLength: otp?.length
    });

    const response = await sendEmailJSRequest(templateParams);
    
    // EmailJS returns status 200 and text 'OK' on success
    if (response.status === 200 && response.text === 'OK') {
      console.log('✅ Email sent successfully to:', email);
      return { success: true, message: 'Verification email sent successfully' };
    } else {
      const errorMsg = `EmailJS returned unexpected response: Status ${response.status}, Text: ${response.text || 'Unknown'}`;
      console.error('❌ EmailJS error:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('EmailJS send error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Provide user-friendly error messages
    if (error.message.includes('EmailJS is not configured')) {
      throw new Error('Email service is not configured. Please contact support.');
    } else if (error.message.includes('recipients address is empty') || error.message.includes('recipient')) {
      throw new Error(
        'EmailJS recipient address is not configured. ' +
        'Please configure your EmailJS service to accept dynamic recipients. ' +
        'In your EmailJS dashboard, go to your service settings and either: ' +
        '1) Set a default "To Email" field, or ' +
        '2) Enable "Accept dynamic recipients" and use {{to_email}} or {{email}} in the "To Email" field.'
      );
    } else if (error.message.includes('Invalid template ID') || error.message.includes('template_id')) {
      throw new Error('Email template is not configured correctly. Please contact support.');
    } else if (error.message.includes('Invalid service ID') || error.message.includes('service_id')) {
      throw new Error('Email service is not configured correctly. Please contact support.');
    } else if (error.message.includes('user_id') || error.message.includes('public key')) {
      throw new Error('Email service authentication failed. Please check your public key.');
    } else if (error.message.includes('400')) {
      throw new Error('Invalid request. Please check your EmailJS configuration.');
    } else if (error.message.includes('422')) {
      throw new Error(`EmailJS validation error: ${error.message}. Please check your EmailJS service and template configuration.`);
    } else if (error.message) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    } else {
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }
};

