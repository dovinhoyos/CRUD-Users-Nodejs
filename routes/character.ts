import type { IncomingMessage, ServerResponse } from 'http';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/authentication';
import { getAllCharacters } from '../models';

export const characterRouter = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    const { method, url } = req;
    
    if(!await authenticateToken(req as AuthenticatedRequest, res)){
        res.statusCode = 401;
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    };

    if(url === '/characters' && method === 'GET'){
        const characters = getAllCharacters();
        res.statusCode = 200;
        res.end(JSON.stringify(characters));
        return;
    }
    

}