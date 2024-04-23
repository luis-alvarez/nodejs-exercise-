import axios from 'axios';

const API_BASE_URL = 'https://shows-remote-api.com/';

const INITIAL_TIME_SPACING = 15; // seconds between each show update

const SECONDS_IN_AN_HOUR = 60 * 60;

const INITIAL_SHOWS_AMOUNT_PER_HOUR = SECONDS_IN_AN_HOUR / INITIAL_TIME_SPACING;

const quantityHasBeenChangedInAPI = (showsInAPIResponse) => (showInDb) => {
    const showInAPIResponse = showsInAPIResponse.find(show => show.id === showInDb.id);
    return showInDb.quantity != showInAPIResponse.quantity;
};

/**
 * 
 * @param {Int} updatedShowCount amount of shows to be updated
 * @returns Int number of seconds to wait between each update API call
 */
const getTimeSpacing = (updatedShowCount) => {
    if (updatedShowCount > INITIAL_SHOWS_AMOUNT_PER_HOUR) {
        return SECONDS_IN_AN_HOUR / updatedShowCount;
    }

    return INITIAL_TIME_SPACING;
};
export class Scheduler {
    #showsRespository;

    constructor(repository) {
        this.#showsRespository = repository;
    }

    async getUpdatedShowIds() {
        try {
            const [allShowsResponse, showsInDb] = await Promise.all([
                axios.get(API_BASE_URL),
                this.#showsRespository.findMany({
                    "where": {
                        "OR": [
                            {
                                "last_update": {
                                    gte: SECONDS_IN_AN_HOUR
                                }
                            },
                            {
                                "last_update": null
                            }
                        ]
                    }
                })
            ]);
            const allShows = allShowsResponse.data;
    
            const showsToBeUpdated = showsInDb.filter(quantityHasBeenChangedInAPI(allShows));
    
            return showsToBeUpdated.map(show => show.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error getting updated shows ids");
        }
    }

    async getUpdateSchedule() {
        try {
            const updatedShowIds = await this.getUpdatedShowIds();
    
            const spacing = getTimeSpacing(updatedShowIds.length);
    
            const updateSchedule = updatedShowIds.map((showId, index) => {
                return {
                    "id": showId,
                    "updateTime": Math.floor(index * spacing)
                }
            });
    
            return updateSchedule.reduce((prev, current) => {
                prev[current.id] = current.updateTime;
                return prev;
            }, {});
        } catch (error) {
            console.error(error);
            throw new Error("Error while getting update schedule");
        }
    }

}