import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { z } from "zod";
import dotenv from 'dotenv'
dotenv.config();

const secretkey = process.env.JWTsecretKey || ''

export const createAccessToke = (payloud:JSON):string =>{
    return jwt.sign(payloud, secretkey, {expiresIn: '30m'})
}
export const createRefreshToke = (payloud:JSON):string =>{
    return jwt.sign(payloud, secretkey, {expiresIn: '15d'})
}


export const verifyToken = (req:Request, res:Response, next:NextFunction):any {
    const accessToken = req.headers.authorization
    if(!accessToken && !req.body['refresh-token']) return res.status(400).send('no authorization')

    const token = accessToken?.split(' ')[1] || ''
    const isAuth = jwt.verify(token, secretkey)

    if(req.body['refresh-token'])

}


