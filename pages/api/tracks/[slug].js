import Track from '@/models/Track'
import {ReasonPhrases, StatusCodes} from 'http-status-codes'

export default async function handler (req, res) {
  const trackSlug = req.params.slug
  switch (req.method) {
    case 'GET':
      const track = await Track.findOne({ slug: trackSlug })
      if (!track)
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'Inexistent track!' })
      return res.status(StatusCodes.OK).send(track)
    case 'PATCH':
      const track = await Track.findOneAndUpdate({ slug: trackSlug }, new Track(req.body))
      if (!track)
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'Inexistent track!' })
      return res.status(StatusCodes.OK).send({ message: ReasonPhrases.OK })
    case 'DELETE':
      try {
        await Track.deleteOne({ slug: trackSlug })
        return res.status(StatusCodes.GONE).send({ message: "Deleted track!" })
      }
      catch (err) {
        logger.error(err)
        return res.send(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: ReasonPhrases.INTERNAL_SERVER_ERROR })
      }
    default:
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send({ error: ReasonPhrases.METHOD_NOT_ALLOWED })
  }
}
