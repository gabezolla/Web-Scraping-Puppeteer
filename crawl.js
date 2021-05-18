const puppeteer = require('puppeteer');
const fs = require('fs');
const genre = 'action'
connectBrowser(genre);

async function connectBrowser(genreChoice) {
    
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

    fs.writeFile(`${genreChoice}.json`, JSON.stringify(movieObject, null, 2), error => {
        if(error) throw new Error("We couldn't save the data on JSON file");
        console.log("Data saved!");
    });

    await browser.close();
}



