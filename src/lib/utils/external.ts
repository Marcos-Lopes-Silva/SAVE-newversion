import axios from "axios";
import { IOption } from "../../../models/surveyModel";


export async function getAllCountries() {
    const response = await axios.get('https://restcountries.com/v3.1/all');

    const allCountriesNames: IOption[] = response.data.map((country: any, index: number) => { return { id: index++, label: country.name.official, value: country.name.official.toLowerCase() } });
    return allCountriesNames;
}

export async function getAllStatesByName(name: string) {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);

}