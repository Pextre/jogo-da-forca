import * as restify from "restify";
import { Router } from "../common/router";
import { Player } from "./player.model";
import NameGen from "../common/namegen";
class PlayerRouter extends Router {

    constructor() {
        super();
    }

    public applyRoutes(application: restify.Server) : void {

        application.get("/players", (req, res, next) => {

            Player.find().then(players => {
                res.json(players);
                return next();
            }).catch(next);

        });


        application.get("/players/:nickname", (req, res, next) => {

            const { nickname } = req.params;

            Player.findOne({ nickname }).then(player => {
                res.json(player);
                return next();
            }).catch(next);

        });

        application.post("/players", (req, res, next) => {

            if (!req.body.nickname) {
                const generator = new NameGen.Generator("ss");
                req.body.nickname = generator.toString();
            }
            const player = new Player(req.body);
            player.save().then(newPlayer => {
                res.json(newPlayer);
                return next();
            }).catch(next);

        });

        application.put("/players/:nickname", (req, res, next) => {
            const options = { overwrite: false };
            Player.update({ nickname: req.params.nickname }, req.body, options).exec()
                .then(result => {
                    // se o update atualizou algo
                    if (result.n) {
                        return Player.find({nickname: req.params.nickname});
                    } else {
                        throw new Error("Document not found.");
                    }
                }).then(player => {
                    res.json(player);
                    return next();
                }).catch(next)
        });

    }
}

export const playerRouter = new PlayerRouter();
