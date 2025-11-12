import { v2 as cloudinary } from 'cloudinary';
import { config as envConfig } from "dotenv";
import { sleep } from './other';
import axios from 'axios';

envConfig();

const api = axios.create({
    baseURL: "https://graph.instagram.com"
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Instagram error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
)

const postToInstagram = async (filePath: string, caption: string) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        });

        const uploadResponse = await cloudinary.uploader.upload(filePath);

        const mediaResponse = await api({
            method: "POST",
            
            url: `/${ process.env.INSTAGRAM_VERSION }/${ process.env.IG_ACCOUNT_ID }/media`,
            params: {
                image_url: uploadResponse.url,
                access_token: process.env.IG_ACCOUNT_ACCESS_TOKEN,
                caption: caption
            }
        });

        await sleep(2500);

        const postResponse = await api({
            method: "POST",
            
            url: `/${ process.env.INSTAGRAM_VERSION || "" }/${ process.env.IG_ACCOUNT_ID }/media_publish`,
            params: {
                creation_id: mediaResponse.data.id,
                access_token: process.env.IG_ACCOUNT_ACCESS_TOKEN
            }                
        });

        console.log("Sucessfully posted to instagram: ", postResponse.data.id); 

    } catch(err) {
        console.log("Err (while posting to instagram)");
    }
}

const formatHashTag = (hashtag: string) => {
    return hashtag
        .replace(/[^\w]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export { postToInstagram, formatHashTag };