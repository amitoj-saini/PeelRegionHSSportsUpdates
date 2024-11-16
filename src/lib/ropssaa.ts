import axios, { Axios, AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import moment from "moment";
import qs from "qs";

interface Game {
    league: string,
    date: string,
    time: string,
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    let leagues: [string, string][] = [];
    leaguesHTML.find("option").each((index, row) => {
        let i = $(row);
        let leagueId = i.attr("value") || "";
        let leagueName = i.text()
        if (leagueId != "ALL") leagues.push([leagueId, leagueName]);
    });

    return leagues;
}

export const fetchGamesFromLeague = async (leagueId: string, leagueName: string) => {
    const response = await ropssaaApi({
        url: "/viewScores.php",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify({
            leagueid: "ALL",
            dateSelect: "ALL",
            schoolSelect: "ALL",
            leagueSelect: leagueId
        })
    });
    
    const res = await ropssaaApi({
        url: "/printableSchedule.php",
        params: { leagueid: leagueId, divisionid: "ALL", schoolid: "ALL" },
        headers: {
            "Cookie": response.headers["set-cookie"]?.join(" ")
        }
    });

    
    const $ = cheerio.load(res.data);

    let table = $("table");
    let currentNote = "";
    let games: Game[] = [];

    table.find("tr").each((index, row) => {
        if (index != 0) {
            let tdChildren = $(row).find("td").length;
            if (tdChildren == 8) {
                games.push({
                    "league": leagueName,
                    "date": $(row).find("td").eq(0).text().trim(),
                    "time": $(row).find("td").eq(1).text().trim(),
                    "awayteam": {
                        "name": $(row).find("td").eq(2).text().trim(),
                        "score": $(row).find("td").eq(3).text().trim()
                    },
                    "hometeam": {
                        "name": $(row).find("td").eq(4).text().trim(),
                        "score": $(row).find("td").eq(5).text().trim()
                    },
                    "location": $(row).find("td").eq(6).text().trim(),
                    "notes": [currentNote, $(row).find("td").eq(7).text().trim()].join(" "),
                });
            } else if (tdChildren == 1) {
                currentNote = $(row).find("td").eq(0).text().trim();
            }
        }
    });

    return games;
}

export const fetchAllGames = async () => {
    let leagues = await fetchLeagues();
    //let leagues = [["15", "Tier 2 Senior Boys Volleyball"]]
    for (let i=0; i<leagues.length; i++) {
        let league = leagues[i];
        let leagueId = league[0];
        let leagueName = league[1];
        let games = await fetchGamesFromLeague(leagueId, leagueName);
        console.log(games);
        await sleep(1000); // robssa rate limit
    }
}