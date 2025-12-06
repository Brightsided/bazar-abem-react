import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<Buffer> => {
  try {
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 200,
      margin: 1,
    });
    return qrBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Error al generar código QR');
  }
};

export const generateQRCodeDataURL = async (data: string): Promise<string> => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      width: 200,
      margin: 1,
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Error al generar código QR');
  }
};
