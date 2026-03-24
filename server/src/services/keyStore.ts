import crypto from 'crypto';

const generateSecret = (): string => {
  const random   = crypto.randomBytes(64).toString('hex');  
  const time     = Date.now().toString(36);                 
  const extra    = crypto.randomBytes(16).toString('base64'); 
  return crypto
    .createHash('sha512')
    .update(random + time + extra)                        
    .digest('hex');                                         
};

export default generateSecret;