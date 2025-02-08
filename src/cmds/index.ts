import { fetchStoredSchools, fetchTodaysPostedGames, storeTodaysPostedGames } from "../lib/datastoreManager";
import { createImagesFromGames } from "../lib/createImages";
import { postToInstagram } from "../lib/postContent";
import { fetchGames } from "../lib/ropssaa";
import moment from "moment";
import fs from "fs";

(async () => {
    let momentToday = moment();

    let schools = fetchStoredSchools();
    let todaysPostedGames = fetchTodaysPostedGames(momentToday);
    let games = await fetchGames(momentToday);
    
    
    let createdImages = await createImagesFromGames(schools, todaysPostedGames, games, "/tmp");
    let postedGames = createdImages.map(creation => creation.game);
    
    storeTodaysPostedGames(postedGames, momentToday);

    for (let i=0; i<createdImages.length; i++ ) {
        let e = createdImages[i];
        let caption = `${e.game.league} - ${e.game.hometeam.name} vs. ${e.game.awayteam.name} (${e.game.date}, ${e.game.notes})`;
        console.log("Posting: ", caption, e.image);
        await postToInstagram(e.image, caption);
        console.log("\n"); 
        // delete the file before continuing
        fs.unlinkSync(e.image);
    }
})();