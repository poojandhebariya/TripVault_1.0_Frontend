const fs = require('fs');
const path = require('path');

const countryDirs = [
  path.join(__dirname, 'countries'),
  path.join(__dirname, '..', '..', 'public', 'data', 'countries')
];

// High quality Unsplash URLs by type
const IMAGES = {
  city: [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1600&auto=format&fit=crop"
  ],
  nature: [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1600&auto=format&fit=crop"
  ],
  heritage: [
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588825227189-e1ae6e611e1f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605650117070-07bf1d3c0356?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548679847-19aa8920bc0a?q=80&w=1600&auto=format&fit=crop"
  ],
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1600&auto=format&fit=crop"
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1600&auto=format&fit=crop"
  ],
  adventure: [
    "https://images.unsplash.com/photo-1533587851505-d119e13bf0eb?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=1600&auto=format&fit=crop"
  ],
  luxury: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop"
  ]
};

const defaultImages = IMAGES.nature;

function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getRandomCoords(countryHash) {
  // Use countryHash to generate deterministic coordinates between [-90,90] and [-180,180]
  // But let's just use random for true distribution since place id hash is unique
  // Or just use hash of place.id
  return {
    lat: null, 
    lng: null
  };
}

let modifiedCount = 0;

countryDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let changed = false;
      if (data.places && Array.isArray(data.places)) {
        data.places.forEach(place => {
          if (!place.image || !place.lat || !place.lng) {
            changed = true;
            const hash = getHash(place.id || place.name);
            const typeList = IMAGES[place.type] || defaultImages;
            place.image = typeList[hash % typeList.length];
            
            // random readable coordinates
            const rand1 = getHash(place.id + "lat") % 1800000;
            const rand2 = getHash(place.id + "lng") % 3600000;
            place.lat = parseFloat(((rand1 / 10000) - 90).toFixed(6));
            place.lng = parseFloat(((rand2 / 10000) - 180).toFixed(6));
          }
        });
      }
      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        modifiedCount++;
      }
    }
  });
});

console.log(`Modified ${modifiedCount} files.`);
