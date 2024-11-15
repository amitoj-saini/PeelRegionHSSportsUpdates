import axios, { Axios, AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";

// robsaa site
const url = "https://www.ropssaa.org/";

export const robsaaApi = async (options: AxiosRequestConfig) => {
    
    const res = await axios(Object.assign({
        method: "get",
        baseURL: url,
        url: "/displaySchools.php",
        validateStatus: () => true
    }, options))

    return res;
};

export const getAvailableSchools = async () => {
    const res = await robsaaApi({
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