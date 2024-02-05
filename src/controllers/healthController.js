import {checkRedisLiveliness} from '../utils/healthValidation.js';

export function readinessController(req, res) {
    let redisStatus;
    try {
        redisStatus = checkRedisLiveliness();
    } catch (error) {
        console.error('Error checking Redis liveliness:', error);
        redisStatus = false;
    }
    if (redisStatus) {
        res.status(204).send();
    } else {
        res.status(500).json({ error: 'Could not access the redis server' });
    }
}