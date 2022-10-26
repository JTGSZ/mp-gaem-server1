import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { ArcadePhysics } from "arcade-physics";
import { Body } from 'arcade-physics/lib/physics/arcade/Body';
import Game_Body from "../extended_shit/extended_arcade_body";

const FPS = 60;
const CAT_WIDTH = 32;
const CAT_HEIGHT = 32;
const CAT_SPEED = 200;

export class MyRoom extends Room<MyRoomState> {

	physics: ArcadePhysics = null;
	tick: number = 0;
	bodies: Record<string, Body> = {};

	collisiongroup: Array<Body> = []
	collisiongroup_attacks: Array<Body> = []

	tempdata: any //lol

  	onCreate(options: any) {
    	this.setState(new MyRoomState());

		this.onMessage("input", (client, { up, left, down, right, attack }) => {
			const body = this.bodies[client.sessionId];

			if (up) {
				body.setVelocityY(-CAT_SPEED);
			}
			else if (down) {
				body.setVelocityY(CAT_SPEED);
			}
			else {
				body.setVelocityY(0);
			}

			if (left) {
				body.setVelocityX(-CAT_SPEED);
			}
			else if (right) {
				body.setVelocityX(CAT_SPEED);
			}
			else {
				body.setVelocityX(0);
			}

      		if(attack){
				let attackbody = this.physics.add.body(body.x, body.y, 64, 64)
				attackbody.enable = true
    			var overlap = this.physics.add.overlap(attackbody, this.collisiongroup, this.attack_collision);
				overlap.destroy()
				//We have the session ID on all of the game bodies, so basically here
				//We'd check the client sessionID to make sure they don't get damaged from their own attack
				//Then on the body that does receive it if it passes that check we decrease their health
				//And we keep all of this synced lol
      		}
    	});

		// Initialize the room's physics
		const config = {
		sys: {
			game: {
			config: {}
			},
			settings: {
				physics: {
					debug: true,
					gravity: {
						x: 0,
						y: 0
					}
				}
			},
			scale: {
			width: 2400 * 2,
			height: 1200
			},
			queueDepthSort: () => {}
		}
		};

    	this.physics = new ArcadePhysics(config);
		this.physics.add.collider(this.collisiongroup, null, null, null, null)

    	this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  	}
	attack_collision(attackbody: Body, target_body: Body){

		//Here is where you'd do some attack shit i guess cause the processcallback sends in the source and thing that got collided with
	}
	update(deltaTime: number) {
		this.physics.world.update(this.tick * 1000, 1000 / FPS);
		this.tick++;

		this.syncState();
	}

	syncState() {
		// Loop over all the players in the room, and sync their X/Ys with that of their physics body
		this.state.players.forEach((player, sessionId) => {
			const body = this.bodies[sessionId];

			player.x = body.x;
			player.y = body.y;
		});
	}

	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");

		// When a player joins the room, assign them both a state representation and a physics body
		this.state.players.set(client.sessionId, new Player(0, 0));
		let body = new Game_Body(this.physics.world, 0, 0, CAT_WIDTH, CAT_HEIGHT)
		body.client_id = client.sessionId

		this.physics.world.add(body)
		//let body = this.physics.add.body(0, 0, CAT_WIDTH, CAT_HEIGHT);

		this.bodies[client.sessionId] = body
		this.collisiongroup.push(body)
		
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");

		// When a player leaves the room, delete their state representation and physics body
		this.state.players.delete(client.sessionId);
		this.bodies[client.sessionId].destroy();
		delete this.bodies[client.sessionId];
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");
	}

}