import axios, { Axios, AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import moment from "moment";
import qs from "qs";

export interface Game {
    id: string,
    league: string,
    date: string,
    awayteam: {
        name: string,
        score: string
    },
    hometeam: {
        name: string,
        score: string
    },
    location: string,
    notes: string
}

const fetchFirstLetters = (str: string): string => {
    return str.split(" ").map(word => word.charAt(0)).join("")
}

// ropssaa site
const url = "https://www.ropssaa.org/";

export const ropssaaApi = async (options: AxiosRequestConfig) => {
    
    const res = await axios(Object.assign({
        method: "get",
        baseURL: url,
        url: "/displaySchools.php",
        validateStatus: () => true,
    }, options))

    return res;
};

export const getAvailableSchools = async () => {
    const res = await ropssaaApi({
        url: "/displaySchools.php"
    });

    let schools: { 
        logo: string | undefined,
        site: string | undefined,
        name: string,
        classification: string | undefined,
        map: string | undefined
    }[] = [];
    
    const $ = cheerio.load(res.data);

    let table = $("table");
    let headers: { [key: string]: number} = {};

    table.find("tr th").each((index, element) => {
        headers[($(element).text().toLowerCase().split(" ").join(""))] = index;
        
    });

    table.find("tr").each((index, row) => {
       
        try {
            if ($(row).find("th").length == 0) {
                schools.push({
                    "logo": $(row).find("td").eq(headers.logo).find("img").attr("src"),
                    "site": $(row).find("td").eq(headers.schoolname).find("a").attr("href"),
                    "name": $(row).find("td").eq(headers.schoolname).text().trim(),
                    "classification": $(row).find("td").eq(headers.classification).text(),
                    "map": $(row).find("td").eq(headers.maptoschool).find("a").attr("href"),
                });
            }
        } catch {};
    });

    return schools;
};

export const fetchLeagues = async () => {
    const res = await ropssaaApi({
        url: "/viewScores.php"
    });

    const $ = cheerio.load(res.data);
    
    let leaguesHTML = $("select#leagueSelect");
    let leagues: {[key: string]: string} = {};
    leaguesHTML.find("option").each((index, row) => {
        let i = $(row);
        let leagueId = i.attr("value") || "";
        let leagueName = i.text()
        if (leagueId != "ALL") leagues[leagueId] = leagueName;
    });

    return leagues;
}


export const fetchGames = async (date: moment.Moment) => {
    const formattedDate = date.format("YYYY-MM-DD");
    let leagues = await fetchLeagues();

    const res = await ropssaaApi({
        method: "POST",
        url: "/viewScores.php",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify({
            leagueid: "ALL",
            dateSelect: formattedDate,
            schoolSelect: "ALL",
            leagueSelect: "ALL"
        })
    });

    const $ = cheerio.load(res.data);
    
    let table = $("table");

    let emptyGame: Game = {
        id: "", league: "", date: "",
        awayteam: {
            name: "",
            score: ""
        },
        hometeam: {
            name: "",
            score: ""
        }, location: "", notes: "" };

    let games: Game[] = [];
    let game: Game = structuredClone(emptyGame);

    let nextTableRow: {[key: string]: boolean} = { scoreBoard: false };

    table.find("tr").each((index, tr) => {
        if ($(tr).attr("style") != undefined) {
            games.push(game);
            game = structuredClone(emptyGame);
        } else {
            if (nextTableRow.scoreBoard) {
                nextTableRow.scoreBoard = false;
                let tableData = $(tr).find("td");
                // tableData.length == 4: Game is completed
                if (tableData.length == 4) {
                    game.date = formattedDate;
                    let awayHref = tableData.eq(0).find("a:not([target])");
                    let awayParams = new URLSearchParams(awayHref.attr("href")?.split("?").at(-1));
                    game.awayteam.name = awayHref.text().trim();
                    game.awayteam.score = tableData.eq(1).text().trim().replace("\n", " ");

                    let homeHref = tableData.eq(3).find("a:not([target])");
                    game.hometeam.name = homeHref.text().trim();
                    game.hometeam.score = tableData.eq(2).text().trim();

                    let leagueid = awayParams.get("leagueid") || ""
                    if (leagueid in leagues) {
                        game.league = leagues[leagueid];
                    }
                    
                    // unique id to identify between games
                    game.id = (leagueid+fetchFirstLetters(game.hometeam.name)+game.hometeam.score+fetchFirstLetters(game.awayteam.name)+game.awayteam.score).replace(/\s+/g, "")
                }
            }

            let trText = $(tr).text().toLowerCase();
            if (trText.includes("score")) {
                nextTableRow.scoreBoard = true;
            } else if (trText.includes("location:") && trText.includes("notes:")) {
                let tableData = $(tr).find("td");
                if (tableData.length == 2) {
                    game.location = (tableData.eq(0).text().split("Location:").at(-1) || "").trim();
                    game.notes = (tableData.eq(1).text().split("Notes:").at(-1) || "").trim();
                }
            }
        }
    });

    return games;
}