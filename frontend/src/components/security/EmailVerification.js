import axios from 'axios';

// Get API key from environment variables
const ABSTRACT_API_KEY = import.meta.env.VITE_ABSTRACT_EMAIL_API_KEY;

export async function verifyEmail(email) {
  try {
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/`, {
      params: {
        api_key: ABSTRACT_API_KEY,
        email: email
      }
    });
    
    const data = response.data;

    // Check if the email is deliverable and not disposable
    if (data.deliverability === 'DELIVERABLE' && !data.is_disposable_email) {
      return {
        isValid: true,
        message: 'Email is valid'
      };
    } else {
      let message = 'Invalid email: ';
      if (data.deliverability !== 'DELIVERABLE') {
        message += 'Email is not deliverable';
      }
      if (data.is_disposable_email) {
        message += 'Temporary/disposable email addresses are not allowed';
      }
      
      return {
        isValid: false,
        message
      };
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      isValid: false,
      message: 'Error verifying email. Please try again.'
    };
  }
} 