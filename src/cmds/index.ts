import { fetchStoredSchools, logoStore } from "../lib/datastoreManager";
import { fetchGames } from "../lib/ropssaa";
import moment from "moment";
import sharp from "sharp";
import path from "path";

// height and width of generated image
const width = 1080;
const height = 556;

// github font
const font = "'Mona Sans', 'MonaSansFallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

// logo height and width
const logoWidth = 100;
const logoHeight = 100;

(async () => {
    let schools = fetchStoredSchools();
    let games = await fetchGames(moment("2024-12-19"));
    
    for (let i=0; i<games.length; i++) {
        let game = games[i];

        if (game.date != "" && game.hometeam.name in schools && game.awayteam.name in schools) {
            let homeTeamImg = await sharp(path.join(logoStore, schools[game.hometeam.name].logo)).resize(logoWidth, logoHeight, {fit: "inside"}).toBuffer();
            let homeTeamImgMetaData = await sharp(homeTeamImg).metadata();
            let awayTeamImg = await sharp(path.join(logoStore, schools[game.awayteam.name].logo)).resize(logoWidth, logoHeight, {fit: "inside"}).toBuffer();
            let awayTeamImgMetaData = await sharp(awayTeamImg).metadata();
            
            
            console.log(homeTeamImgMetaData)
            let compositeInputs = [
                {
                    input: Buffer.from(
                        `<svg width="${width}" height="${height}">
                            <text fill="black" font-weight="400" font-family="${font}" text-anchor="middle" x="50%" y="80" font-size="28">${game.league}</text>
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="${width / 4}" y="170" font-size="20">Home</text>
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="${width - (width / 4)}" y="170" font-size="20">Away</text>
                            <circle cx="${(width / 4)}" cy="${(height / 2)}" r="80" fill="rgb(225, 225, 225)" />
                            <circle cx="${width - (width / 4)}" cy="${(height / 2)}" r="80" fill="rgb(225, 225, 225)" />
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="50%" y="50%" font-size="80">${game.hometeam.score.split(" ")[0]}<tspan fill="rgba(0, 0, 0, 0.2)">:</tspan>${game.awayteam.score.split(" ")[0]}</text>
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="${width / 4}" y="390" font-size="16">${game.hometeam.name}</text>
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="${width - (width / 4)}" y="390" font-size="16">${game.awayteam.name}</text>
                            
                            <rect x="50%" y="430" width="${(game.date.length * 8) + 10}" height="${30}" fill="rgb(225, 225, 225)" rx="20" ry="20" transform="translate(-${((game.date.length * 8) + 10) / 2}, 0)" />
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="50%" y="450" font-size="14">${game.date}</text>

                            <rect x="50%" y="470" width="${(game.notes.length * 8) + 10}" height="${30}" fill="rgb(225, 225, 225)" rx="20" ry="20" transform="translate(-${((game.notes.length * 8) + 10) / 2}, 0)" />
                            <text fill="black" font-weight="100" font-family="${font}" text-anchor="middle" x="50%" y="490" font-size="14">${game.notes}</text>
                            
                        </svg>`
                    )
                },
                
                { 
                    input: await homeTeamImg,
                    top: Math.round((height - (homeTeamImgMetaData.height || logoHeight)) / 2),
                    left: Math.round((width / 4) - (logoWidth / 2)),    
                },
                { 
                    input: await awayTeamImg,
                    top: Math.round((height - (awayTeamImgMetaData.height || logoHeight)) / 2),
                    left: Math.round(width - (width / 4) - (logoWidth / 2)),
                }
                
                
            ]
            
            sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 3,
                    background: { r: 230, g: 230, b: 230 }
                }
            })
            .composite(compositeInputs)
            .toFile("test.png", (err, info) => {
                console.log("Err:", err, "Info:", info)
            });
            
        }
        console.log(game.id);
        break;
    }
})();