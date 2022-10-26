import { Body } from "arcade-physics/lib/physics/arcade/Body";

export default class Game_Body extends Body{
    client_id: String
    health: number = 100
    constructor(world:any, x: number, y: number, width: number, height:number){
        super(world, x, y, width, height);
    }
    
}