const fs = require('fs');

async function convertDataUrlsToBlob(files) {
  const fileBlobs = await Promise.all(files.map(async (fileDataUrl) => {
    const byteString = atob(fileDataUrl.split(',')[1]);
    const mimeString = fileDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: mimeString });
    return blob;
  }));
  return fileBlobs;
}

async function convertBlobToBlobArrayAndSave(filenames, fileBlobs, foldername) {
  const fileLocations = [];
  for (let i = 0; i < fileBlobs.length; i++) {
    const arrayBuffer = await fileBlobs[i].arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dirname = __dirname;
    const splitData = dirname.split('\\');
    splitData.pop();
    const dirName = splitData.join('\\');
    const filename = dirName + `\\public\\${foldername}\\` + Date.now() + filenames[i];
    const lastPortion = filename.split('\\');
    const finalName = lastPortion.pop();
    fileLocations.push(`${foldername}\\`+finalName);
    fs.writeFileSync(filename, buffer);
  }
  return fileLocations;
}

module.exports = {
  convertDataUrlsToBlob,
  convertBlobToBlobArrayAndSave
};