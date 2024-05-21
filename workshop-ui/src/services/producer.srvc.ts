import axios from "axios";
import {PRODUCER_URL} from "../config/constants";

export class ProducerService {
    static getPrettyTime(): string {
        const d = new Date()
        return d.toLocaleTimeString("en-US", { hour12: false }) + `:${d.getMilliseconds()}`
    }

    static async postEvent(event: any){
        return axios.post(PRODUCER_URL, event)
    }

    static fetchUsers(): {[key: string]: Object} {
        return  {
            'elroy': {
                'id': 'elroy',
                'name': "Elroy Winterbone",
                'dept': "HR",
                'email': "elroy@company.com",
                'device': "linux"
            },
            'ursula': {
                'id': 'ursula',
                'name': "Ursula Higgenbothom",
                'dept': "Finance",
                'email': "ursula@company.com",
                'device': "ipad"
            },
            'wilhelm': {
                'id': 'wilhelm',
                'name': "Wilhelm Ghandt",
                'dept': "Operations",
                'email': "wilhelm@company.com",
                'device': "windows"
            },
            'indira': {
                'id': 'indira',
                'name': "Indira Bethel",
                'dept': "Finance",
                'email': "indira@company.com",
                'device': "mac"
            },
            'francisco': {
                'id': 'francisco',
                'name': "Francisco Oberon",
                'dept': "HR",
                'email': "francisco@company.com",
                'device': "android"
            },
            'harmon': {
                'id': 'harmon',
                'name': "Harmon Iglesias",
                'dept': "HR",
                'email': "harmon@company.com",
                'device': "linux"
            },
            'mamoud': {
                'id': 'mamoud',
                'name': "Mamoud Albertson",
                'dept': "Operations",
                'email': "mamoud@company.com",
                'device': "linux"
            },
            'ingvar': {
                'id': 'ingvar',
                'name': "Ingvar Collins",
                'dept': "Finance",
                'email': "ingvar@company.com",
                'device': "windows"
            },
            'roman': {
                'id': 'roman',
                'name': "Roman Williams",
                'dept': "Operations",
                'email': "roman@company.com",
                'device': "mac"
            },
            'jocelyn': {
                'id': 'jocelyn',
                'name': "Jocelyn Nguyen",
                'dept': "HR",
                'email': "jocelyn@company.com",
                'device': "ipad"
            },
        }
    }
}