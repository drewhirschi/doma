import Bottleneck from "bottleneck";
import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";
import { getCompletion } from "../backend/services/jobs/llmHelpers";
import { googleSearch } from "../backend/services/jobs/googlesearch";
import { isNotNull } from "./types/typeHelpers";

type ILinkedInCompany = {
    id: string;
    name: string;
    universalName: string;
    linkedinUrl: string;
    tagline: string;
    description: string;
    type: string;
    phone: string;
    Images: {
        logo: string;
        cover: string;
    };
    backgroundCoverImages: string | null;
    logos: string | null;
    staffCount: number;
    headquarter: {
        geographicArea: string;
        country: string;
        city: string;
        postalCode: string;
    };
    locations: [];
    industries: string[];
    specialities: string[];
    website: string;
    founded: { year: number };
    callToAction: string | null;
    followerCount: number;
    staffCountRange: string;
    crunchbaseUrl: string;
};


export interface LinkedInDataProvider {
    getCompany(companySlug: string): Promise<ILinkedInCompany | null>;
}


type RapidApiRes = {
    success: boolean;
    message: string;
    data: ILinkedInCompany | null
};
export class RapidApiLinkdeInScraper implements LinkedInDataProvider {

    rapidapiLinkedIn = axios.create({
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'

        },
        baseURL: 'https://linkedin-api8.p.rapidapi.com',
    })

    limiter = new Bottleneck({
        minTime: 25,
        maxConcurrent: 1
    });

    async getCompany(companySlug: string): Promise<ILinkedInCompany | null> {

        const params = {
            username: companySlug
        }

        try {
            const response = await this.limiter.schedule(() =>
                this.rapidapiLinkedIn.get<RapidApiRes>('/get-company-details', { params })
            )


            return response.data.data
        } catch (error) {
            console.error(error);
            return null
        }

    }

    sbFormat(liCompany: ILinkedInCompany) {



        const cmpLiProfile: Omit<LinkedInProfile_SB, "updated_at"> = {
            slug: liCompany.universalName,
            url: liCompany.linkedinUrl,
            description: liCompany.description,
            headcountRange: liCompany.staffCountRange,
            website: liCompany.website,
            industries: liCompany.industries,
            specialities: liCompany.specialities,
            founded_year: liCompany.founded?.year,
            hq_area: liCompany.headquarter?.geographicArea,
            hq_country: liCompany.headquarter?.country,
            hq_postal_code: liCompany.headquarter?.postalCode,
            follower_count: liCompany.followerCount,
        }

        return cmpLiProfile

    }
}


export async function searchForLinkedInCompanySlug(cmpSummary: string) {

    try {
        const searchQuery = await getCompletion({
            system: `Create a Google search query to find the LinkedIn page of a company based on the provided company summary.

# Steps
1. Identify the company's name from the company summary provided.
2. Formulate a Google search query using the company name.
3. Add the term "LinkedIn" to the search query to target the LinkedIn page.

# Output Format
Present the Google search query as a simple text string. Don't wrap the query in quotes.

# Notes
- For companies with common names, consider adding additional unique identifiers from the summary if available.
- For companies where location is important, include the location.`,
            user: cmpSummary,
        })
        if (!searchQuery) {
            throw new Error('Failed to get search query')
        }

        const results = await googleSearch(searchQuery)


        const possilbeLiUrls = new Set<string>()

        results.items.filter((item) => item.link.startsWith('https://www.linkedin.com/company/'))
            .map((item) => parseCompanySlug(item.link))
            .filter(isNotNull)
            .forEach((url) => possilbeLiUrls.add(url))

        return Array.from(possilbeLiUrls)

    } catch (error) {
        console.error(error)
        return []
    }
}

export function parseCompanySlug(url: string) {
    try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);

        if (pathSegments[0] !== 'company' || pathSegments.length < 2) {
            console.warn('Invalid linkedin company URL:', url);
            return null;
        }

        return pathSegments[1];
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

export async function llmChooseProfile(profiles: ILinkedInCompany[], webSummary: string): Promise<ILinkedInCompany | null> {

    const universalName = await getCompletion({
        system: `Return the universalName and nothing else of the LinkedIn profile JSON that matchings the given summary more closely.`,
        user: `## Summary:\n${webSummary}\n\n## Profiles:\n${JSON.stringify(profiles)}`, // webSummary
    })

    if (!universalName) {
        console.warn('Failed to get universalName')
        return null
    }


    return profiles.find((profile) => profile.universalName === universalName) || null
}


