import { v2 as cloudinary } from 'cloudinary';
import { config as envConfig } from "dotenv";
import axios from 'axios';

envConfig();

const baseURL = "https://graph.instagram.com";


const postToInstagram = async (filePath: string, caption: string) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        });

        const uploadResponse = await cloudinary.uploader.upload(filePath);

        const mediaResponse = await axios({
            method: "POST",
            
            url: `https://graph.instagram.com/${ process.env.INSTAGRAM_VERSION }/${ process.env.IG_ACCOUNT_ID }/media`,
            params: {
                image_url: uploadResponse.url,
                access_token: process.env.IG_ACCOUNT_ACCESS_TOKEN,
                caption: caption
            }
        });

        

        const postResponse = await axios({
            method: "POST",
            baseURL: baseURL,     
            url: `/${ process.env.INSTAGRAM_VERSION || "" }/${ process.env.IG_ACCOUNT_ID }/media_publish`,
            params: {
                creation_id: mediaResponse.data.id,
                access_token: process.env.IG_ACCOUNT_ACCESS_TOKEN
            }                
        });

        console.log("Sucessfully posted to instagram: ", postResponse.data.id); 

    } catch(err) {
        console.log("Err (while posting to instagram): ", err);    
    }    
}

export { postToInstagram };