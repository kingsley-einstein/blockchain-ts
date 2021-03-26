import express from "express";
export default class Controller {
    static createKeys(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    static addNewTx(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    static mineBlock(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    static validateChain(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    static getChain(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
}
