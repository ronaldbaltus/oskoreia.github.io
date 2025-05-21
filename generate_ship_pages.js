var fs = require('fs');
//var yaml = require('js-yaml');
var https = require('https');

//////
/// Data handling
//////
var data = {
    slugify: function(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
            .replace(/^-+|-+$/g, '');    // Trim leading/trailing dashes
    },
    download: function() {
        var scApiUrl = process.env.STARCITIZEN_API_URL;
        if (!scApiUrl) {
            throw new Error('STARCITIZEN_API_URL not set');
        }

        const storeApiData = function (url, filepath) {
            return new Promise((resolve, reject) => {
                https.get(scApiUrl + url, (resp) => {
                    var file = fs.openSync(filepath, 'w');

                    resp.on('data', (chunk) => {
                        fs.writeSync(file, chunk);
                    });
                    resp.on('end', () => {
                        fs.closeSync(file);
                        console.info(`${filepath} successfully downloaded`);
                        resolve();
                    });
                }).on('error', reject);
            });
        }

        const imports = [
            { url: 'v1/auto/ships', target: 'ships_raw.json' },
            { url: 'v1/auto/organization/OSKOREIA', target: 'organization.json' },
            { url: 'v1/live/organization_members/OSKOREIA', target: 'organization_members.json' },
        ];

        const jobs = imports.map(x => storeApiData(x.url, __dirname + '/_data/' + x.target));
        return Promise.all(jobs).then(() => {
            console.info('Data downloaded');
        }).catch((err) => {
            console.error('Error downloading data', err);
        });
    },

    mapDataFiles: function (filename) {
        let ships_raw = JSON.parse(fs.readFileSync(__dirname + `/_data/${filename}`, 'utf8')).data.filter(x => x != null);
        
        console.info('Mapping manufacturers...', ships_raw.length);
        let manufacturers = map.manufacturers(ships_raw);
        fs.writeFileSync(__dirname + '/_data/manufacturers.json', JSON.stringify(manufacturers, null, 2));

        console.info('Mapping ships...', ships_raw.length);
        let filteredShips = map.ships(ships_raw);
        fs.writeFileSync(__dirname + '/_data/ships.json', JSON.stringify(filteredShips, null, 2));
    },

    generateShipPages: function () {
        let ships = JSON.parse(fs.readFileSync('_data/ships.json', 'utf8'));
        let targetDir = __dirname + '/_ships/';

        for (let i=0; i < ships.length; i++) {
            var ship = ships[i];
            fs.writeFileSync(targetDir + ship.manufacturer.code + '_' + ship.code + '.md', data.generateShipPage(i, ship));

            //if (i >= 10) break;
        }
    },

    generateShipPage: function(index, ship) {
        console.info(`Generating page for ${ship.name}...`);

        return `---
layout: ship
title: Oskoreia - Ship - ${ship.manufacturer.name} - ${ship.name}
---
{% assign ship = site.data.ships[${index}] %}
{% assign manufacturer = site.data.manufacturers[${ship.manufacturer.code}] %}
{% include ship.html ship=ship manufacturer=manufacturer %}
`;
    }
}


////
// Mapping
////
var map = {
    ship: function (ship) {
        let retval = {};

        for (let x in ship) {
            if (typeof ship[x] !== 'object') {
                retval[x] = ship[x];
            }
        }

        retval.code = data.slugify(ship.name);
        retval.manufacturer = {
            code: ship.manufacturer.code,
            name: ship.manufacturer.name
        }

        var media = ship.media[0];

        if (media) {
            retval.media = {
                avatar: media.images.avatar,
                logo: media.images.logo,
                cover: media.images.cover,
            }
        }

        return retval;
    },

    ships: function (ships) {
        return ships.map(map.ship);
    },

    manufacturer: function (manufacturer) {
        var retval = {};

        for (let x in manufacturer) {
            if (typeof manufacturer[x] !== 'object') {
                retval[x] = manufacturer[x];
            }
        }

        var media = manufacturer.media[0];

        retval.media = {
            avatar: media.images.avatar,
            logo: media.images.logo,
            cover: media.images.cover,
        }

        return retval;
    },

    manufacturers: function (ships) {
        var retval = {};

        for (var i=0; i < ships.length; i++) {
            var ship = ships[i];

            if (!ship.manufacturer) continue;
            if (retval[ship.manufacturer.code]) continue;

            retval[ship.manufacturer.code] = map.manufacturer(ship.manufacturer);
        }

        return retval;
    }
}

if (process.env.DOWNLOAD_DATA == 1) {
    data.download().then(() => {
        data.mapDataFiles('ships_raw.json');
        data.generateShipPages();
    }).catch((err) => {
        console.error('Error downloading data', err);
        process.exit(1);
    });
} else {
    data.mapDataFiles('ships_raw.json');
    data.generateShipPages();
}
