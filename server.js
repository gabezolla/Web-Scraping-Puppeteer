const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const port = 3000;
const STATIC_DIR = path.join(__dirname, "static");

const app = express();
app.use(bodyParser.json());
app.listen(port, () => console.log("Server listening on port 3000..."));

app.engine("handlebars", handlebars({
    helpers: { }
}));

app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "views"));

/**
 * Express routes
 */
app.use('/', express.static(STATIC_DIR));
app.use(express.urlencoded({ extended: true }));


app.post('/ranking', async (req, res) => {
    const rankList = await crawlInfo(req.body.select);
    
    res.render("list", {
        movie: rankList
    });
})

app.get('ranking/:genre', (req, res) => {
    res.send((req.params.genre)); 
});

app.use('/ranking/crime', express.static(STATIC_DIR + "/crime.html"));

// crawlInfo(genre);

async function crawlInfo(genreChoice) {
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.imdb.com/search/title/?genres=${genreChoice}&sort=user_rating,desc&title_type=feature&num_votes=25000,&`)

    // manipula o DOM no site aberto
    const movieObject = await page.evaluate(() => {

        const getMovieList = document.querySelectorAll(".lister-item-header a");
        const getRank = document.querySelectorAll('.ratings-imdb-rating strong');

        const movieArray = [...getMovieList];
        const rankArray = [...getRank];
        
        let completeObject = [{}]
        
        for(let i=0; i<movieArray.length; i++) {
            completeObject[i] = {
                movie: movieArray[i].innerHTML,
                rating: rankArray[i].innerHTML            
            }
        }

        return completeObject;
    })

    /* fs.writeFile(`${genreChoice}.json`, JSON.stringify(movieObject, null, 2), error => {
        if(error) throw new Error("We couldn't save the data on JSON file");
        console.log("Data saved!");
    }); */

    await browser.close();
    return movieObject;
}


