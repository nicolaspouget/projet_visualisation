const fs = require("fs");
const country = require('country-list-js');
fs.readFile("data/wasabi-artist.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    let artistes = JSON.parse(jsonString);
    var continents = ['North America', 'South America', 'Africa', 'Europe', 'Asia', 'Oceania'];
    var genres = ['Rock', 'Hip Hop', 'Pop', 'Indie Rock', 'Alternative Rock', 'Country', 'Folk', 'Punk Rock',
        'Indie Pop', 'Electronic', 'Heavy Metal', 'Pop Rock', 'R&B', 'Post-Hardcore', 'MetalCore', 'Blues',
        'Freestyle', 'Hardcore Punk', 'Progressive Rock', 'Black Metal'];
    var types = ['Group', 'Others', 'Person'];
    var objet = {};
    objet.name = "";
    objet.children = [];
    continents.forEach(function(continent){
        var continentJSON = {};
        continentJSON.name = continent
        continentJSON.children = [];
        types.forEach(function(type){
            var typeJSON = {};
            typeJSON.name = type;
            typeJSON.children = [];
            genres.forEach(function(genre){
                var genreJSON = {};
                genreJSON.name = genre;
                genreJSON.value = 0;
                typeJSON.children.push(genreJSON);
            });
            continentJSON.children.push(typeJSON);
        });
        objet.children.push(continentJSON);
    })

    artistes.forEach(function(artiste){
        var countryFound = country.findByName(artiste.location.country)
        if(artiste.name!='' && artiste.genres != "[]" && countryFound!=undefined){
            var genreArtiste = JSON.parse(artiste.genres);
            objet.children.forEach(function(continent){
                if(continent.name == countryFound.continent){
                    continent.children.forEach(function(type){
                        if(type.name == artiste.type || (type.name=="Others" && artiste.type != undefined)){
                            type.children.forEach(function(genre){
                                if(genreArtiste.includes(genre.name)){
                                    genre.value++;
                                };
                            });
                        };
                    });
                };
            });
        }
    });
    let data = JSON.stringify(objet);
    fs.writeFileSync('data/sunburst.json', data);
});