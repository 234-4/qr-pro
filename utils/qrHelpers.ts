
export const formatWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const formatEmail = (to: string, subject: string, body: string) => {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const formatWiFi = (ssid: string, password: string, encryption: string, hidden: boolean) => {
  return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : ''};;`;
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
