import db from '@/utils/db'
import Track from '@/models/Track'
import {ReasonPhrases, StatusCodes} from 'http-status-codes'

export default async function handler (req, res) {
  switch (req.method) {
    case 'GET':
      return res.status(ReasonPhrases.OK).send(await Track.find())
    default:
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send(ReasonPhrases.METHOD_NOT_ALLOWED)
  }
}
