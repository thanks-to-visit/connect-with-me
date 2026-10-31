/**
 * Converts a base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Downloads a data URL using a Blob + object URL + temporary <a download>,
 * then cleans up the object URL.
 */
export async function downloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const blob = dataUrlToBlob(dataUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      // Clean up after small delay to ensure browser handles download
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          resolve();
        } catch (e) {
          URL.revokeObjectURL(blobUrl);
          resolve();
        }
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
}
