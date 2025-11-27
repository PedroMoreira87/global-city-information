export interface User {
	id: string;
	name: string;
	email: string;
	weather: IWeather[];
	created_at?: Date;
}

export interface IWeather {
	place: Place;
	temperature: number;
	feelsLike: number;
	description: string;
	humidity: number;
	latitude: number;
	longitude: number;
	created_at?: Date;
}

export interface Place {
	city: string;
	state: string;
	country: string;
}
