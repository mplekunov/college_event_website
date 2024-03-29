import IUser from "../../serverAPI/model/internal/user/IUser";

declare module "express-serve-static-core" {
    interface Request {
        serverUser: IUser;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            NODE_ENV: string;

            PRIVATE_KEY_FOR_USER_TOKEN: string;

            // DB_CONNECTION_STRING_TESTING: string;

            DB_NAME: string;
            DB_USERNAME: string;
            DB_PASSWORD: string;
            DB_CONNECTION_STRING: string;
            
            // LOCAL_MONGODB_CONNECTION_STRING: string;
            // MONGODB_CONNECTION_STRING: string;

            // DB_CONNECTION_STRING_TESTING: string;
            // DB_CONNECTION_STRING: string;

            // MONGODB_CONNECTION_STRING: string;
            // LOCAL_MONGODB_CONNECTION_STRING: string;


            // SPOONACULAR_API_KEY: string;
            // SPOONACULAR_HOST: string;

            // SPOONACULAR_INGREDIENTS_BASE_URL: string;
            // SPOONACULAR_GROCERY_PRODUCT_BASE_URL: string;
            // SPOONACULAR_RECIPE_BASE_URL: string;
            // SPOONACULAR_CONVERTER_BASE_URL: string;
            // SPOONACULAR_CDN_BASE_URL: string;
            // SPOONACULAR_RECIPE_PRICE_BREAKDOWN_BASE_URL: string;
            // SPOONACULAR_RECIPE_PRICE_BREAKDOWN_WIDGET: string;

            // SENDGRID_API_KEY: string;

            // OUTBOUND_VERIFICATION_EMAIL: string;

            // SENDGRID_VERIFICATION_EMAIL_TEMPLATEID: string;

            // FREE_IMAGE_HOST_BASE_URL: string;
            // FREE_IMAGE_HOST_API_KEY: string;
        }

    }
}

export { };
