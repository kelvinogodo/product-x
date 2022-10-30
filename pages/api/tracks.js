import Track from '@/models/Track'
import {ReasonPhrases, StatusCodes} from 'http-status-codes'

export default async function handler (req, res) {
  switch (req.method) {
    case 'GET':
      return res.status(StatusCodes.OK).send(await Track.find())
    case 'PUT':
      const trackName = req.body.name
      try {
        const track = await Track.create({ name: trackName })
        return res.status(StatusCodes.CREATED).send(track)
      }
      catch (err) {
        console.log(err)
        return res.send(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: ReasonPhrases.INTERNAL_SERVER_ERROR })
      }
    default:
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send({ error: ReasonPhrases.METHOD_NOT_ALLOWED })
  }
}
