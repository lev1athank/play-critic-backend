import { z } from "zod";


export const loginUserDto = z.object({
    'login': z.string().min(3).max(30),
    'password': z.string().min(6).max(100)
})

export const createUserDto = z.object({
    'login': z.string().min(3).max(30),
    'userName': z.string().min(3).max(30),
    'password': z.string().min(6).max(100)
})