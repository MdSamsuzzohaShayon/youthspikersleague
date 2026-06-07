import { IEvent } from "../../types";
import { hostname } from "../global";

interface IEventResponse {
    events: IEvent;
}

export async function getAllEvents(): Promise<IEvent[]> {
    try {
        const response = await fetch(`${hostname}/api/event`, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Error fetching events: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse.events;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}



export async function getSingleEvent(id: string): Promise<IEvent | null> {
    try {
        const response = await fetch(`${hostname}/api/event/${id}`, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Error fetching event: ${response.statusText}`);
        }

        const jsonResponse: IEventResponse = await response.json();
        return jsonResponse.events;
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}