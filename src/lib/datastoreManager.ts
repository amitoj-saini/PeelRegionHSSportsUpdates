import { Cookie } from "puppeteer";
import { Game } from "./ropssaa";
import moment from "moment";
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

const fetchTodaysPostedGames = () => {
    const date = moment().format("YYYY-MM-DD");
    let todaysGames : {[ key: string ]: Game} = {};
    try {
        todaysGames = JSON.parse(fs.readFileSync(path.join(gamesStore, `${date}.json`), "utf-8"))
    } catch {}

    return todaysGames;
}

const storeTodaysPostedGames = (games: Game[]) => {
    const date = moment().format("YYYY-MM-DD");
    let todaysGames : {[ key: string ]: Game} = Object.fromEntries(
        games.map(game => [game.id, game])
    )

    todaysGames = Object.assign(todaysGames, fetchTodaysPostedGames());
    
    fs.writeFileSync(path.join(gamesStore, `${date}.json`), JSON.stringify(todaysGames, null, 4));
}

const fetchStoredCookies = () => {
    let cookies : Cookie[] = [];

    try {
        cookies = JSON.parse(fs.readFileSync(path.join(otherData, "cookies.json"), "utf-8"));
    } catch {};

    return cookies;
}

const storeFetchedCookies = (cookies: Cookie[]) => {    
    fs.writeFileSync(path.join(otherData, "cookies.json"), JSON.stringify(cookies));
}

export {fetchStoredSchools, fetchTodaysPostedGames, storeTodaysPostedGames, fetchStoredCookies, storeFetchedCookies, logoStore, otherData};