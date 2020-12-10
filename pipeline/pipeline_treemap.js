const fs = require("fs");
fs.readFile("data/wasabi-artist.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    let artistes = JSON.parse(jsonString);
    var compte = 0;
    var genres = ['Rock', 'Hip Hop', 'Pop', 'Indie Rock', 'Alternative Rock', 'Country', 'Folk', 'Punk Rock',
        'Indie Pop', 'Electronic', 'Heavy Metal', 'Pop Rock', 'R&B', 'Post-Hardcore', 'MetalCore', 'Blues',
        'Freestyle', 'Hardcore Punk', 'Progressive Rock', 'Black Metal']
    var genresObject = [];
    genres.forEach(function(genre){
        var genreJSON = {};
        genreJSON.key = genre;
        genreJSON.values = [];
        genresObject.push(genreJSON);
    })
    artistes.forEach(function(artiste){
        if(artiste.urlDeezer!='' && artiste.name!='' && artiste.genres != "[]"){
            var genreArtiste = JSON.parse(artiste.genres);
            var nouvelArtiste = {};
            nouvelArtiste.key = artiste.name;
            nouvelArtiste.value = parseInt(artiste.deezerFans);
            genresObject.forEach(function(genre){
                if(genreArtiste.includes(genre.key)){
                    genre.values.push(nouvelArtiste);
                    compte ++;
                }
            });
        }
    });
    console.log(compte);
    let data = JSON.stringify(genresObject);
    fs.writeFileSync('data/treemap-data.json', data);
});