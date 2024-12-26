import { Request, Response, Router } from 'express'
import { AuthService } from './authorization.service';
import { createUserDto } from './auth.dto';

const router = Router()
const authService = new AuthService()

router.post('/create', async (req:Request, res:Response): Promise<any> => {
    const validation = createUserDto.safeParse(req.body)
    if(req.body.password==req.body.login) return res.status(204).send("pass = login")
    if(!validation.success) return res.status(204).json(validation.error.errors[0])

    const auth = await authService.createUser(req.body)
    return res.status(200).json({
        isAuth: auth
    })
    
})
router.post('/login', (req:Request, res:Response)=> {
    const auth = authService.createUser(req.body)
})

export const authRouter = router