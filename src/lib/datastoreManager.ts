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
const dataLists = path.join(rootDir, "datastore", "data", "lists");
const logoStore = path.join(rootDir, "datastore", "images", "logos");

const schoolList = path.join(dataLists, "schools.json");


const fetchStoredSchools = ()  => {
    let data: { [key: string]: School } = {}
    try {
        data = JSON.parse(fs.readFileSync(schoolList, "utf8"));
    } catch {}
    return data;
};

export {fetchStoredSchools, logoStore};