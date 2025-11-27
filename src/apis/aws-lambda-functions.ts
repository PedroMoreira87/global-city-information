import { fetchAuthSession } from "aws-amplify/auth";
import axios from "axios";
import type { IWeather } from "../interfaces/user.interface.ts";

async function authHeaders() {
	// Get current session and id token
	const { tokens } = await fetchAuthSession();

	if (!tokens?.idToken) {
		throw new Error("No ID token available");
	}

	const token = tokens.idToken.toString();
	return { Authorization: `Bearer ${token}` };
}

export const geolocation = async (cityInput: string) => {
	const headers = await authHeaders();
	const response = await axios.post(
		"https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/geolocations",
		{ cityInput },
		{ headers },
	);
	return response.data;
};

export const weatherData = async (
	selectedCityLat: number,
	selectedCityLon: number,
) => {
	const headers = await authHeaders();
	const response = await axios.post(
		"https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/weather",
		{ selectedCityLat, selectedCityLon },
		{ headers },
	);
	return response.data;
};

export const updateUser = async (userId: string, userWeather: IWeather) => {
	const headers = await authHeaders();
	const response = await axios.put(
		`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`,
		userWeather,
		{ headers },
	);
	return response.data;
};

export const getUser = async (userId: string) => {
	const headers = await authHeaders();
	const response = await axios.get(
		`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`,
		{ headers },
	);
	return response.data;
};
