import { Game } from "./ropssaa";
import moment, { Moment } from "moment";
import * as path from "path";
import * as fs from "fs";

interface School {
    id: string,
    site: string,
    name: string,
    logo: string,
    classifacation: string,
    map: string
}

const rootDir = path.resolve(__dirname, "../../");
const otherData = path.join(rootDir, "datastore", "data", "other");
const dataLists = path.join(rootDir, "datastore", "data", "lists");
const logoStore = path.join(rootDir, "datastore", "images", "logos");
const gamesStore = path.join(rootDir, "datastore", "data", "games");

const schoolList = path.join(dataLists, "schools.json");


const fetchStoredSchools = () => {
    let data: { [key: string]: School } = {}
    try {
        data = JSON.parse(fs.readFileSync(schoolList, "utf8"));
    } catch {}
    return data;
};

const fetchTodaysPostedGames = (momentObj: Moment) => {
    const date = momentObj.format("YYYY-MM-DD");
    let todaysGames : {[ key: string ]: Game} = {};
    try {
        todaysGames = JSON.parse(fs.readFileSync(path.join(gamesStore, `${date}.json`), "utf-8"))
    } catch {}

    return todaysGames;
}

const storeTodaysPostedGames = (games: Game[], momentObj: Moment) => {
    const date = momentObj.format("YYYY-MM-DD");
    let todaysGames : {[ key: string ]: Game} = Object.fromEntries(
        games.map(game => [game.id, game])
    )

    todaysGames = Object.assign(todaysGames, fetchTodaysPostedGames(momentObj));
    
    fs.writeFileSync(path.join(gamesStore, `${date}.json`), JSON.stringify(todaysGames, null, 4));
}

export {fetchStoredSchools, fetchTodaysPostedGames, storeTodaysPostedGames, School, logoStore, otherData};