import { Body } from "arcade-physics/lib/physics/arcade/Body";

export default class Game_Body extends Body{
    client_id: String
    constructor(x: number, y: number, width: number, height:number){
        super(undefined, x, y, width, height);
    }
}