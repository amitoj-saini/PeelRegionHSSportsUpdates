import { fetchGames } from "../lib/ropssaa";
import moment from "moment";

(async () => {
    let games = await fetchGames(moment("2024-11-14"));
    console.log(JSON.stringify(games, null, 4));
})();