import {ReasonPhrases, StatusCodes} from 'http-status-codes'

export default function handler (req, res) {
  switch (req.method) {
    case "GET":
      return []
    default:
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send(ReasonPhrases.METHOD_NOT_ALLOWED)
  }
}
